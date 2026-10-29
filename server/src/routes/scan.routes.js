import express from "express";
import { rateLimit } from "express-rate-limit";

import {
  createScan,
  getScans,
  getScan,
  updateFindingStatus,
} from "../controllers/scan.controller.js";

import {
  ingestScan,
  getScanFiles,
  getScanChunks,
  queueScanIndex,
} from "../controllers/ingestion.controller.js";

import {
  createScanValidator,
  scanIdValidator,
} from "../validators/scan.validator.js";

import { findingStatusValidator } from "../validators/finding.validator.js";
import { protect, checkOrigin } from "../middlewares/auth.middleware.js";

import { searchScan } from "../rag/controllers/search.controller.js";
import { searchValidator } from "../rag/validators/search.validator.js";

import { queueAnalysis } from "../ai/controllers/analysis.controller.js";
import {
  chatWithScan,
  getChatHistory,
} from "../ai/controllers/chat.controller.js";
import { chatValidator } from "../ai/validators/chat.validator.js";

import {
  getLoggingPreferences,
  updateLoggingPreferences,
} from "../controllers/preferences.controller.js";

import {
  loggingPreferencesValidator,
} from "../validators/preferences.validator.js";

import {
  chatHistoryValidator,
} from "../ai/validators/chatHistory.validator.js";



const router = express.Router();

const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user.id),
  message: {
    success: false,
    message: "Too many scan requests. Please try again later.",
  },
});

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user.id),
  message: {
    success: false,
    message: "Too many chat messages. Please try again later.",
  },
});

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

router.use(checkOrigin, protect);

router.get(
  "/preferences/logging",
  getLoggingPreferences,
);

router.patch(
  "/preferences/logging",
  loggingPreferencesValidator,
  updateLoggingPreferences,
);

router.get(
  "/:scanId/chat",
  scanIdValidator,
  chatHistoryValidator,
  getChatHistory,
);

router.patch(
  "/:scanId/findings/:findingId",
  scanIdValidator,
  findingStatusValidator,
  updateFindingStatus,
);

router.post(
  "/:scanId/chat",
  chatLimiter,
  scanIdValidator,
  chatValidator,
  chatWithScan,
);

router.post(
  "/:scanId/search",
  scanLimiter,
  scanIdValidator,
  searchValidator,
  searchScan,
);

router.post(
  "/:scanId/analyze",
  scanLimiter,
  scanIdValidator,
  queueAnalysis,
);

router.post(
  "/",
  scanLimiter,
  createScanValidator,
  createScan,
);

router.get("/", getScans);

router.post(
  "/:scanId/ingest",
  scanLimiter,
  scanIdValidator,
  ingestScan,
);

router.post(
  "/:scanId/index",
  scanLimiter,
  scanIdValidator,
  queueScanIndex,
);

router.get(
  "/:scanId/files",
  scanIdValidator,
  getScanFiles,
);

router.get(
  "/:scanId/chunks",
  scanIdValidator,
  getScanChunks,
);

router.get("/:scanId", scanIdValidator, getScan);

export default router;