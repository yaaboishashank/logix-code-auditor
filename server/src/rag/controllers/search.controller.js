import Scan from "../../models/scan.model.js";
import { retrieveCode } from "../services/retrieval.service.js";

export const searchScan = async (req, res, next) => {
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

    if (
      scan.status !== "ready" ||
      scan.indexStatus !== "ready" ||
      !scan.indexNamespace
    ) {
      return res.status(409).json({
        success: false,
        message: "Wait until code indexing is complete.",
      });
    }

    const matches = await retrieveCode(scan, req.body.query);

    return res.json({
      success: true,
      scanId: scan.id,
      query: req.body.query,
      count: matches.length,
      matches,
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};