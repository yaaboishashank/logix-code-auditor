import mongoose from "mongoose";
import {
  DEFAULT_LOGGING_RULES,
  isValidLoggingRules,
} from "../config/loggingRules.js";

const scanSchema = new mongoose.Schema(
  {
    loggingRules: {
      type: [String],
      default: () => [...DEFAULT_LOGGING_RULES],
      immutable: true,
      validate: {
        validator: isValidLoggingRules,
        message: "Invalid scan logging rules.",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    repository: {
      type: String,
      required: true,
    },
    repositoryUrl: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    commitSha: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["validated", "queued", "fetching", "ready", "failed"],
      default: "validated",
    },
    fileCount: {
      type: Number,
      default: 0,
    },
    skippedFileCount: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: "",
    },
    indexStatus: {
      type: String,
      enum: ["pending", "queued", "indexing", "ready", "failed"],
      default: "pending",
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    indexError: {
      type: String,
      default: "",
    },
    indexNamespace: {
      type: String,
      default: "",
    },
    embeddingModel: {
      type: String,
      default: "",
    },
    embeddingDimensions: {
      type: Number,
      default: 0,
    },
    analysisStatus: {
      type: String,
      enum: ["pending", "running", "ready", "failed"],
      default: "pending",
    },

    analysisError: {
      type: String,
      default: "",
    },

    analysisModel: {
      type: String,
      default: "",
    },

    findings: [
      {
        rule: {
          type: String,
          enum: DEFAULT_LOGGING_RULES,
        },
        title: { type: String, required: true },
        severity: {
          type: String,
          enum: ["low", "medium", "high"],
          required: true,
        },
        path: { type: String, required: true },
        startLine: { type: Number, required: true },
        endLine: { type: Number, required: true },
        explanation: { type: String, required: true },
        originalCode: { type: String, required: true },
        suggestedCode: { type: String, required: true },
        status: {
          type: String,
          enum: ["open", "resolved", "ignored"],
          default: "open",
        },
      },
    ],
  },
  { timestamps: true },
);

scanSchema.index({ user: 1, createdAt: -1 });
scanSchema.index({ status: 1, createdAt: 1 });
scanSchema.index({ status: 1, indexStatus: 1, createdAt: 1 });

export default mongoose.model("Scan", scanSchema);
