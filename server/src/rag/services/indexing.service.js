import { createHash } from "node:crypto";
import { setTimeout as wait } from "node:timers/promises";
import config from "../../config/config.js";
import SourceFile from "../../models/sourceFile.model.js";
import { createCodeChunks } from "./chunk.service.js";
import { createEmbedding } from "./embedding.service.js";
import { getPineconeIndex } from "./pinecone.service.js";

const inputError = (message) => {
  const error = new Error(message);
  error.statusCode = 422;
  return error;
};

export const indexScanFiles = async (scan) => {
  const files = await SourceFile.find({ scan: scan.id }).sort({ path: 1 });

  if (files.length !== scan.fileCount) {
    throw inputError("Source files are incomplete. Create a new scan.");
  }

  const chunks = files.flatMap(createCodeChunks);

  if (!chunks.length) {
    throw inputError("No code chunks available to index.");
  }

  if (chunks.length > 200) {
    throw inputError("This version supports up to 200 chunks per scan.");
  }

  if (config.EMBEDDING_MODEL !== "gemini-embedding-2") {
    throw inputError("Set EMBEDDING_MODEL to gemini-embedding-2.");
  }

  const index = getPineconeIndex();
  const stats = await index.describeIndexStats();

  if (stats.dimension !== config.EMBEDDING_DIMENSIONS) {
    throw inputError("Pinecone and embedding dimensions must match.");
  }

  const version = createHash("sha256")
    .update(JSON.stringify([
      "v1",
      scan.commitSha,
      config.EMBEDDING_MODEL,
      config.EMBEDDING_DIMENSIONS,
      chunks,
    ]))
    .digest("hex")
    .slice(0, 24);

  const namespace = `${scan.user}:${scan.id}:${version}`;
  const scopedIndex = index.namespace(namespace);
  const ids = chunks.map((_, index) => `chunk-${index}`);
  const { records = {} } = await scopedIndex.fetch({ ids });

  for (let index = 0; index < chunks.length; index += 1) {
    if (records[ids[index]]) continue;

    const chunk = chunks[index];
    const values = await createEmbedding(chunk.content);

    await scopedIndex.upsert({
      records: [{
        id: ids[index],
        values,
        metadata: {
          ...chunk,
          scanId: scan.id,
          userId: String(scan.user),
          commitSha: scan.commitSha,
          embeddingModel: config.EMBEDDING_MODEL,
        },
      }],
    });

    console.log(`Indexing ${scan.id}: ${index + 1}/${chunks.length}`);
    await wait(1000);
  }

  return {
    chunkCount: chunks.length,
    indexNamespace: namespace,
    embeddingModel: config.EMBEDDING_MODEL,
    embeddingDimensions: config.EMBEDDING_DIMENSIONS,
  };
};