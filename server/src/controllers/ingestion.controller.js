import Scan from "../models/scan.model.js";
import SourceFile from "../models/sourceFile.model.js";
import { createCodeChunks } from "../rag/services/chunk.service.js";

export const ingestScan = async (req, res, next) => {
  try {
    const filter = {
      _id: req.params.scanId,
      user: req.user.id,
    };

    let scan = await Scan.findOneAndUpdate(
      {
        ...filter,
        status: { $in: ["validated", "failed"] },
      },
      {
        $set: {
          status: "queued",
          errorMessage: "",
          fileCount: 0,
          skippedFileCount: 0,
        },
      },
      { new: true }
    );

    if (!scan) {
      scan = await Scan.findOne(filter);
    }

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found.",
      });
    }

    const ready = scan.status === "ready";

    return res.status(ready ? 200 : 202).json({
      success: true,
      message: ready
        ? "Files already ingested."
        : "Ingestion accepted. Check scan status.",
      scan,
    });
  } catch (error) {
    next(error);
  }
};

export const getScanFiles = async (req, res, next) => {
  try {
    const scan = await Scan.findOne({
      _id: req.params.scanId,
      user: req.user.id,
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found.",
      });
    }

    if (scan.status !== "ready") {
      return res.status(409).json({
        success: false,
        message: "Source files are not ready yet.",
      });
    }

    const files = await SourceFile.find({ scan: scan.id })
      .sort({ path: 1 });

    return res.json({
      success: true,
      count: files.length,
      files,
    });
  } catch (error) {
    next(error);
  }
};

export const getScanChunks = async (req, res, next) => {
  try {
    const scan = await Scan.findOne({
      _id: req.params.scanId,
      user: req.user.id,
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found.",
      });
    }

    if (scan.status !== "ready") {
      return res.status(409).json({
        success: false,
        message: "Source files are not ready yet.",
      });
    }

    const files = await SourceFile.find({ scan: scan.id })
      .sort({ path: 1 });

    const chunks = [];

    files.forEach((file) => {
      chunks.push(...createCodeChunks(file));
    });

    return res.status(200).json({
      success: true,
      scanId: scan.id,
      commitSha: scan.commitSha,
      count: chunks.length,
      chunks,
    });
  } catch (error) {
    next(error);
  }
};

export const queueScanIndex = async (req, res, next) => {
  try {
    const filter = {
      _id: req.params.scanId,
      user: req.user.id,
    };

    let scan = await Scan.findOneAndUpdate(
      {
        ...filter,
        status: "ready",
        $or: [
          { indexStatus: { $in: ["pending", "failed"] } },
          { indexStatus: { $exists: false } },
        ],
      },
      {
        $set: {
          indexStatus: "queued",
          indexError: "",
          chunkCount: 0,
        },
      },
      { new: true }
    );

    if (!scan) scan = await Scan.findOne(filter);

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found.",
      });
    }

    if (scan.status !== "ready") {
      return res.status(409).json({
        success: false,
        message: "Source files are not ready yet.",
      });
    }

    return res.status(scan.indexStatus === "ready" ? 200 : 202).json({
      success: true,
      scan,
    });
  } catch (error) {
    next(error);
  }
};