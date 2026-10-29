import mongoose from "mongoose";
import Scan from "../../models/scan.model.js";
import config from "../../config/config.js";
import { loggingGraph } from "../graphs/logging.graph.js";

let started = false;
let pendingResult = null;

const saveResult = async () => {
  const { scanId, update } = pendingResult;

  const result = await Scan.updateOne(
    { _id: scanId, analysisStatus: "running" },
    { $set: update }
  );

  if (result.matchedCount === 1) {
    console.log(`Analysis ${update.analysisStatus}: ${scanId}`);
  } else {
    console.warn(
      `Scan ${scanId} changed or was already saved; no overwrite.`
    );
  }

  pendingResult = null;
};

const processNextAnalysis = async () => {
  if (pendingResult) {
    await saveResult();
    return;
  }

  const scan = await Scan.findOneAndUpdate(
    {
      status: "ready",
      indexStatus: "ready",
      analysisStatus: "pending",
    },
    {
      $set: {
        analysisStatus: "running",
        analysisError: "",
      },
    },
    {
      new: true,
      sort: { createdAt: 1 },
    }
  );

  if (!scan) return;

  try {
    console.log(`Analysis started: ${scan.id}`);

    const result = await loggingGraph.invoke({
      scanId: scan.id,
      fileCount: scan.fileCount,
    });

    pendingResult = {
      scanId: scan.id,
      update: {
        findings: result.findings,
        analysisStatus: "ready",
        analysisError: "",
        analysisModel: config.ANALYSIS_MODEL,
      },
    };
  } catch (error) {
    console.error(`Analysis failed: ${scan.id}`, error.message);

    pendingResult = {
      scanId: scan.id,
      update: {
        analysisStatus: "failed",
        analysisError:
          error.publicMessage ||
          "Analysis could not finish. Check the server terminal before retrying.",
      },
    };
  }

  await saveResult();
};

export const startAnalysisWorker = async () => {
  if (started) return;
  started = true;

  let recovered = false;
  let lastWarning = "";

  const warnOnce = (message) => {
    if (message !== lastWarning) console.warn(message);
    lastWarning = message;
  };

  const run = async () => {
    let delay = 3000;

    try {
      if (mongoose.connection.readyState !== 1) {
        delay = 15000;
        warnOnce(
          "Analysis worker paused: waiting for MongoDB connection."
        );
        return;
      }

      if (!recovered) {
        await Scan.updateMany(
          { analysisStatus: "running" },
          {
            $set: {
              analysisStatus: "failed",
              analysisError:
                "Server restarted during analysis. Please retry.",
            },
          }
        );

        recovered = true;
      }

      await processNextAnalysis();
      lastWarning = "";
    } catch (error) {
      delay = 15000;

      warnOnce(
        `Analysis worker database operation failed: ${error.message}`
      );
    } finally {
      setTimeout(run, delay);
    }
  };

  void run();
};