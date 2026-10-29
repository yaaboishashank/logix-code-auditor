import config from "../../config/config.js";
import { createEmbedding } from "./embedding.service.js";
import { getPineconeIndex } from "./pinecone.service.js";

export const retrieveCode = async (scan, query) => {
  if (
    scan.embeddingModel !== config.EMBEDDING_MODEL ||
    scan.embeddingDimensions !== config.EMBEDDING_DIMENSIONS
  ) {
    const error = new Error(
      "This scan uses different embedding settings. Create a new scan."
    );
    error.statusCode = 409;
    throw error;
  }

  const vector = await createEmbedding(query, true);

  const result = await getPineconeIndex()
    .namespace(scan.indexNamespace)
    .query({
      vector,
      topK: 5,
      includeMetadata: true,
      includeValues: false,
    });

  return (result.matches || []).map(({ id, score, metadata = {} }) => ({
    id,
    score,
    path: metadata.path,
    startLine: metadata.startLine,
    endLine: metadata.endLine,
    content: metadata.content,
  }));
};