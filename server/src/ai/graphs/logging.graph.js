import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import SourceFile from "../../models/sourceFile.model.js";
import { reviewLogging } from "../services/logging.service.js";

import Scan from "../../models/scan.model.js";
import {
  DEFAULT_LOGGING_RULES,
  isValidLoggingRules,
} from "../../config/loggingRules.js";
const State = Annotation.Root({
  scanId: Annotation(),
  fileCount: Annotation(),
  loggingRules: Annotation(),
  files: Annotation(),
  candidates: Annotation(),
  findings: Annotation(),
});

const loadFiles = async ({ scanId, fileCount }) => {
  const scan = await Scan.findById(scanId).select("loggingRules").lean();

  if (!scan) {
    throw new Error("Scan not found.");
  }

  const loggingRules = scan.loggingRules ?? DEFAULT_LOGGING_RULES;

  if (!isValidLoggingRules(loggingRules)) {
    throw new Error("This scan has invalid logging rules.");
  }
  const files = await SourceFile.find({ scan: scanId })
    .select("path content")
    .sort({ path: 1 })
    .lean();

  if (!files.length || files.length !== fileCount) {
    throw new Error("Saved source files are missing or incomplete.");
  }

  const normalizedFiles = files.map((file) => ({
    path: file.path,
    content: file.content.replace(/\r\n?/g, "\n"),
  }));

  const bytes = normalizedFiles.reduce(
    (total, file) => total + Buffer.byteLength(file.content, "utf8"),
    0,
  );

  if (bytes > 120000) {
    throw new Error(
      "This initial analysis supports up to 120 KB of saved source code.",
    );
  }

 return { files: normalizedFiles, loggingRules };
};

const reviewFiles = async ({ files, loggingRules }) => ({
  candidates: await reviewLogging(files, loggingRules),
});

const validateFindings = ({ files, candidates, loggingRules }) => {
  const sources = new Map(
    files.map((file) => [file.path, file.content.split("\n")]),
  );

  const seen = new Set();
  const findings = [];

  for (const item of candidates) {
    if (!item || typeof item !== "object") {
      throw new Error("AI returned an invalid finding.");
    }

    const lines = sources.get(item.path);

    const validText = ["title", "explanation", "suggestedCode"].every(
      (key) =>
        typeof item[key] === "string" &&
        item[key].trim().length > 0 &&
        item[key].length <= 12000,
    );

    

    if (
      !loggingRules.includes(item.rule) ||
      !lines ||
      !validText ||
      !["low", "medium", "high"].includes(item.severity) ||
      !Number.isInteger(item.startLine) ||
      !Number.isInteger(item.endLine) ||
      item.startLine < 1 ||
      item.endLine < item.startLine ||
      item.endLine > lines.length ||
      item.endLine - item.startLine + 1 > 60
    ) {
      throw new Error("AI returned invalid source evidence. Retry analysis.");
    }

    const key = `${item.path}:${item.startLine}:${item.endLine}`;

    if (seen.has(key)) continue;

    const originalCode = lines
      .slice(item.startLine - 1, item.endLine)
      .join("\n");

    if (!originalCode.trim()) {
      throw new Error("AI selected an empty source range.");
    }

    seen.add(key);

    findings.push({
      rule: item.rule,
      title: item.title,
      severity: item.severity,
      path: item.path,
      startLine: item.startLine,
      endLine: item.endLine,
      explanation: item.explanation,
      originalCode,
      suggestedCode: item.suggestedCode,
      status: "open",
    });
  }

  return { findings };
};

export const loggingGraph = new StateGraph(State)
  .addNode("loadFiles", loadFiles)
  .addNode("reviewFiles", reviewFiles)
  .addNode("validateFindings", validateFindings)
  .addEdge(START, "loadFiles")
  .addEdge("loadFiles", "reviewFiles")
  .addEdge("reviewFiles", "validateFindings")
  .addEdge("validateFindings", END)
  .compile();
