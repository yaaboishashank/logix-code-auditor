import mongoose from "mongoose";
import { createHash } from "node:crypto";
import Wallet from "../models/wallet.model.js";
import ChatUsage from "../models/chatUsage.model.js";
import ChatTurn from "../../ai/models/chatTurn.model.js";
import {
  PAYMENT_MODE,
  paymentError,
} from "./payment.service.js";

const getUsageFilter = (user, requestId) => ({
  user,
  mode: PAYMENT_MODE,
  requestId,
});

const getFingerprint = (filter, message) =>
  createHash("sha256")
    .update(
      JSON.stringify([
        String(filter.scan),
        filter.finding ? String(filter.finding) : null,
        message,
      ])
    )
    .digest("hex");

export const findPaidChat = async (filter, requestId, message) => {
  const usage = await ChatUsage.findOne(
    getUsageFilter(filter.user, requestId)
  ).lean();

  if (!usage) return null;

  if (usage.fingerprint !== getFingerprint(filter, message)) {
    throw paymentError(
      "This request ID belongs to a different message.",
      409
    );
  }

  const turn = await ChatTurn.findOne({
    _id: usage.turn,
    ...filter,
  }).lean();

  if (!turn) {
    throw paymentError(
      "Your saved reply could not be loaded. Please retry.",
      503
    );
  }

  return turn;
};

export const requireChatCredit = async (userId) => {
  const wallet = await Wallet.exists({
    user: userId,
    mode: PAYMENT_MODE,
    credits: { $gte: 1 },
  });

  if (!wallet) {
    throw paymentError(
      "No message credits left. Buy a message pack to continue.",
      402
    );
  }
};

export const savePaidChat = async ({
  filter,
  requestId,
  message,
  reply,
}) => {
  await Promise.all([
    ChatUsage.init(),
    ChatTurn.init(),
    Wallet.init(),
  ]);

  try {
    return await mongoose.connection.transaction(async (session) => {
      const turnId = new mongoose.Types.ObjectId();

      await ChatUsage.create(
        [
          {
            ...getUsageFilter(filter.user, requestId),
            fingerprint: getFingerprint(filter, message),
            turn: turnId,
          },
        ],
        { session }
      );

      const wallet = await Wallet.findOneAndUpdate(
        {
          user: filter.user,
          mode: PAYMENT_MODE,
          credits: { $gte: 1 },
        },
        { $inc: { credits: -1 } },
        { new: true, session }
      );

      if (!wallet) {
        throw paymentError(
          "No message credits left. Buy a message pack to continue.",
          402
        );
      }

      const [turn] = await ChatTurn.create(
        [
          {
            _id: turnId,
            ...filter,
            question: message,
            answer: reply.answer,
            sources: reply.sources,
          },
        ],
        { session }
      );

      return turn;
    });
  } catch (error) {
    // A retry may reach here after the original request already committed.
    const saved = await findPaidChat(filter, requestId, message);

    if (saved) return saved;

    throw error;
  }
};