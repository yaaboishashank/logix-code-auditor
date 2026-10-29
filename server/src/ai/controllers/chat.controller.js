import Scan from "../../models/scan.model.js";
import ChatTurn from "../models/chatTurn.model.js";
import { chatGraph } from "../graphs/chat.graph.js";
import {
  findPaidChat,
  requireChatCredit,
  savePaidChat,
} from "../../payments/services/chatCredit.service.js";
import {
  getCreditBalance,
} from "../../payments/services/payment.service.js";

const formatMessages = (turn) => [
  {
    id: `${turn._id}-user`,
    role: "user",
    content: turn.question,
  },
  {
    id: `${turn._id}-assistant`,
    role: "assistant",
    content: turn.answer,
    sources: turn.sources || [],
  },
];

const findChatContext = async (req, res, findingId) => {
  const scan = await Scan.findOne({
    _id: req.params.scanId,
    user: req.user.id,
  }).lean();

  if (!scan) {
    res.status(404).json({
      success: false,
      message: "Scan not found.",
    });

    return null;
  }

  const finding = findingId
    ? scan.findings.find((item) => String(item._id) === findingId)
    : null;

  if (findingId && !finding) {
    res.status(404).json({
      success: false,
      message: "Finding not found in this scan.",
    });

    return null;
  }

  return {
    scan,
    finding,
    filter: {
      user: req.user.id,
      scan: scan._id,
      finding: finding?._id || null,
    },
  };
};

const sendChatResponse = async (res, userId, turn) =>
  res.json({
    success: true,
    answer: turn.answer,
    sources: turn.sources || [],
    messages: formatMessages(turn),
    credits: await getCreditBalance(userId),
  });

export const getChatHistory = async (req, res, next) => {
  try {
    const context = await findChatContext(
      req,
      res,
      req.query.findingId
    );

    if (!context) return;

    const turns = await ChatTurn.find(context.filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(50)
      .lean();

    return res.json({
      success: true,
      messages: turns.reverse().flatMap(formatMessages),
    });
  } catch (error) {
    next(error);
  }
};

export const chatWithScan = async (req, res) => {
  try {
    const { message, findingId, requestId } = req.body;

    const context = await findChatContext(req, res, findingId);

    if (!context) return;

    const { scan, finding, filter } = context;

    const saved = await findPaidChat(filter, requestId, message);

    if (saved) {
      return await sendChatResponse(res, req.user.id, saved);
    }

    if (
      scan.status !== "ready" ||
      scan.indexStatus !== "ready" ||
      scan.analysisStatus !== "ready" ||
      !scan.indexNamespace
    ) {
      return res.status(409).json({
        success: false,
        message: "Complete indexing and analysis before starting chat.",
      });
    }

    await requireChatCredit(req.user.id);

    const previousTurns = await ChatTurn.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(3)
      .lean();

    const history = previousTurns
      .reverse()
      .flatMap(formatMessages)
      .map(({ role, content }) => ({
        role,
        content: content.slice(0, 2000),
      }));

    const result = await chatGraph.invoke({
      scan,
      finding,
      message,
      history,
    });

    const reply = result.reply;

    if (
      typeof reply?.answer !== "string" ||
      !reply.answer.trim() ||
      !Array.isArray(reply.sources)
    ) {
      throw new Error("Invalid chat response.");
    }

    const turn = await savePaidChat({
      filter,
      requestId,
      message,
      reply,
    });

    return await sendChatResponse(res, req.user.id, turn);
  } catch (error) {
    console.error("Chat failed:", error.message);

    if (error.publicMessage) {
      return res.status(error.statusCode || 502).json({
        success: false,
        message: error.publicMessage,
      });
    }

    const status =
      error.statusCode === 409
        ? 409
        : Number(error.status || error.statusCode) === 429
          ? 429
          : 502;

    return res.status(status).json({
      success: false,
      message:
        status === 409
          ? "Embedding settings changed. Create a new scan before chatting."
          : status === 429
            ? "AI usage limit reached. Please try again later."
            : "Chat could not be confirmed. Retry the same message or refresh chat.",
    });
  }
};