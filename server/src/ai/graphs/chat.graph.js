import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { retrieveCode } from "../../rag/services/retrieval.service.js";
import { answerQuestion } from "../services/chat.service.js";

const ChatState = Annotation.Root({
  scan: Annotation(),
  finding: Annotation(),
  message: Annotation(),
  history: Annotation(),
  sources: Annotation(),
  reply: Annotation(),
});

const retrieveContext = async ({ scan, finding, message, history }) => {
  const previousQuestion = history
    .filter((item) => item.role === "user")
    .slice(-1)[0];

  const query = [
    finding?.path,
    finding?.title,
    previousQuestion?.content.slice(0, 300),
    message,
  ]
    .filter(Boolean)
    .join("\n");

  const chunks = await retrieveCode(scan, query);

  const sources = chunks
    .filter(
      (chunk) =>
        typeof chunk.path === "string" &&
        typeof chunk.content === "string" &&
        chunk.content.trim() &&
        Number.isInteger(chunk.startLine) &&
        Number.isInteger(chunk.endLine) &&
        chunk.startLine >= 1 &&
        chunk.endLine >= chunk.startLine
    )
    .map((chunk, index) => ({
      id: `R${index + 1}`,
      path: chunk.path,
      startLine: chunk.startLine,
      endLine: chunk.endLine,
      content: chunk.content,
    }));

  if (finding) {
    sources.unshift({
      id: "F1",
      path: finding.path,
      startLine: finding.startLine,
      endLine: finding.endLine,
      content: finding.originalCode,
      suggestedCode: finding.suggestedCode,
      explanation: finding.explanation,
    });
  }

  return { sources };
};

const generateAnswer = async (state) => ({
  reply: await answerQuestion(state),
});

export const chatGraph = new StateGraph(ChatState)
  .addNode("retrieveContext", retrieveContext)
  .addNode("generateAnswer", generateAnswer)
  .addEdge(START, "retrieveContext")
  .addEdge("retrieveContext", "generateAnswer")
  .addEdge("generateAnswer", END)
  .compile();