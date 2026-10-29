import Scan from "../models/scan.model.js";
import SourceFile from "../models/sourceFile.model.js";
import { fetchSourceFiles } from "../services/ingestion.service.js";
import { indexScanFiles } from "../rag/services/indexing.service.js";

const processNextScan = async () => {
  const scan = await Scan.findOneAndUpdate(
    { status: "queued" },
    { $set: { status: "fetching" } },
    { new: true, sort: { createdAt: 1 } }
  );

  if (!scan) return;

  try {
    const { files, skippedFileCount } = await fetchSourceFiles(scan);

    await SourceFile.deleteMany({ scan: scan.id });

    await SourceFile.insertMany(
      files.map((file) => ({ ...file, scan: scan.id }))
    );

    scan.status = "ready";
    scan.fileCount = files.length;
    scan.skippedFileCount = skippedFileCount;
    scan.errorMessage = "";
    scan.indexStatus = "queued";
    scan.indexError = "";

    await scan.save();

    console.log(`Scan ready: ${scan.id}`);
  } catch (error) {
    const message = error.statusCode
      ? error.message
      : "Could not save source files. Please retry.";

    await Scan.updateOne(
      { _id: scan.id },
      {
        $set: {
          status: "failed",
          fileCount: 0,
          errorMessage: error.retryAfter
            ? `${message} Retry after ${error.retryAfter} seconds.`
            : message,
        },
      }
    );

    console.error(`Scan failed: ${scan.id}`);
  }
};

const processNextIndex = async () => {
  const scan = await Scan.findOneAndUpdate(
    { status: "ready", indexStatus: "queued" },
    { $set: { indexStatus: "indexing", indexError: "" } },
    { new: true, sort: { createdAt: 1 } }
  );

  if (!scan) return;

  try {
    const result = await indexScanFiles(scan);

    await Scan.updateOne(
      { _id: scan.id },
      {
        $set: {
          ...result,
          indexStatus: "ready",
          indexError: "",
        },
      }
    );

    console.log(`Index ready: ${scan.id} (${result.chunkCount} chunks)`);
  } catch (error) {
    const limited = error.status === 429 || error.statusCode === 429;

    const message = limited
      ? "AI service quota reached. Wait for the limit to reset, then retry indexing."
      : error.statusCode === 422
        ? error.message
        : "Indexing failed. Check the server terminal and retry indexing.";

    await Scan.updateOne(
      { _id: scan.id },
      {
        $set: {
          indexStatus: "failed",
          indexError: message,
        },
      }
    );

    console.error(`Indexing failed: ${scan.id}`, error.message);
  }
};

export const startIngestionWorker = async () => {
  await Scan.updateMany(
    { status: "fetching" },
    {
      $set: {
        status: "queued",
        fileCount: 0,
        skippedFileCount: 0,
        errorMessage: "",
        indexStatus: "pending",
        indexError: "",
      },
    }
  );

  await Scan.updateMany(
    { status: "ready", indexStatus: "indexing" },
    { $set: { indexStatus: "queued", indexError: "" } }
  );

  const run = async () => {
    try {
      await processNextScan();
      await processNextIndex();
    } catch (error) {
      console.error("Ingestion worker error:", error.message);
    }

    setTimeout(run, 2000);
  };

  run();
};