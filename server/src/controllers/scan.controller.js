import Scan from "../models/scan.model.js";
import { getRepositoryDetails } from "../services/github.service.js";

import User from "../models/user.model.js";
import { DEFAULT_LOGGING_RULES } from "../config/loggingRules.js";

export const createScan = async (req, res, next) => {
  try {
    const { repositoryUrl, branch } = req.body;

    const repository = await getRepositoryDetails(repositoryUrl, branch);

    const user = await User.findById(req.user.id).select("loggingRules").lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Please log in again.",
      });
    }

    const scan = await Scan.create({
      ...repository,
      user: req.user.id,
      loggingRules: [...(user.loggingRules ?? DEFAULT_LOGGING_RULES)],
    });

    return res.status(201).json({
      success: true,
      message: "Repository validated. Scan record created.",
      scan,
    });
  } catch (error) {
    if (error.statusCode) {
      if (error.retryAfter) {
        res.set("Retry-After", String(error.retryAfter));
      }

      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

export const getScans = async (req, res, next) => {
  try {
    const scans = await Scan.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      scans,
    });
  } catch (error) {
    next(error);
  }
};

export const getScan = async (req, res, next) => {
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

    return res.status(200).json({
      success: true,
      scan,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFindingStatus = async (req, res, next) => {
  try {
    const { scanId, findingId } = req.params;
    const { status } = req.body;

    const result = await Scan.updateOne(
      {
        _id: scanId,
        user: req.user.id,
        analysisStatus: "ready",
        "findings._id": findingId,
      },
      {
        $set: {
          "findings.$.status": status,
        },
      },
      { runValidators: true },
    );

    if (!result.matchedCount) {
      return res.status(404).json({
        success: false,
        message: "Finding not found or analysis is not ready.",
      });
    }

    return res.json({
      success: true,
      finding: {
        _id: findingId,
        status,
      },
    });
  } catch (error) {
    next(error);
  }
};
