import Scan from "../../models/scan.model.js";

export const queueAnalysis = async (req, res, next) => {
  try {
    const filter = {
      _id: req.params.scanId,
      user: req.user.id,
    };

    let scan = await Scan.findOneAndUpdate(
      {
        ...filter,
        status: "ready",
        indexStatus: "ready",
        $or: [
          { analysisStatus: { $in: ["pending", "failed"] } },
          { analysisStatus: { $exists: false } },
        ],
      },
      {
        $set: {
          analysisStatus: "pending",
          analysisError: "",
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

    if (scan.status !== "ready" || scan.indexStatus !== "ready") {
      return res.status(409).json({
        success: false,
        message: "Complete code indexing before analysis.",
      });
    }

    return res.status(scan.analysisStatus === "ready" ? 200 : 202).json({
      success: true,
      scan,
    });
  } catch (error) {
    next(error);
  }
};