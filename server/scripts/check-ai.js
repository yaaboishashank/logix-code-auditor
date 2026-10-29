import config from "../src/config/config.js";
import { createEmbedding } from "../src/rag/services/embedding.service.js";
import { getPineconeIndex } from "../src/rag/services/pinecone.service.js";

const checkConnections = async () => {
  console.log("Checking Pinecone...");

  const index = getPineconeIndex();
  const stats = await index.describeIndexStats();

  if (stats.dimension !== config.EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Pinecone dimensions: ${stats.dimension}. Expected: ${config.EMBEDDING_DIMENSIONS}.`
    );
  }

  console.log(`Pinecone connected: ${stats.dimension} dimensions.`);
  console.log("Checking Gemini...");

  const vector = await createEmbedding(
    "Log errors when the database connection fails."
  );

  console.log(`Gemini connected: ${vector.length} dimensions.`);
  console.log("AI connections ready.");
};

checkConnections().catch((error) => {
  console.error("Connection check failed:", error.message);
  process.exitCode = 1;
});