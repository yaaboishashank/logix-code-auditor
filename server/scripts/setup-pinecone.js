import { Pinecone } from "@pinecone-database/pinecone";
import config from "../src/config/config.js";

const setupPinecone = async () => {
  if (!config.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is missing in .env.");
  }

  const dimensions = config.EMBEDDING_DIMENSIONS;

  if (!Number.isInteger(dimensions) || dimensions < 128 || dimensions > 3072) {
    throw new Error("Check EMBEDDING_DIMENSIONS in .env.");
  }

  const pinecone = new Pinecone({
    apiKey: config.PINECONE_API_KEY,
  });

  const name = "logix-code-gemini";

  console.log("Preparing Gemini vector index...");

  await pinecone.indexes.create({
    name,
    schema: {
      fields: {
        _values: {
          type: "dense_vector",
          dimension: dimensions,
          metric: "cosine",
        },
      },
    },
    deployment: {
      deploymentType: "managed",
      cloud: "aws",
      region: "us-east-1",
    },
    readCapacity: { mode: "OnDemand" },
    waitUntilReady: true,
    timeout: 60000,
    suppressConflicts: true,
  });

  const index = await pinecone.indexes.describe(name);
  const field = index.schema?.fields?._values;

  if (
    field?.type !== "dense_vector" ||
    field.dimension !== dimensions ||
    field.metric !== "cosine"
  ) {
    throw new Error("Existing index has incompatible settings.");
  }

  if (!index.status?.ready) {
    throw new Error("Index is still starting. Run this command again shortly.");
  }

  console.log("Replace these lines in server/.env:");
  console.log(`PINECONE_INDEX_NAME=${index.name}`);
  console.log(`PINECONE_INDEX_HOST=${index.host}`);
};

setupPinecone().catch((error) => {
  console.error("Pinecone setup failed:", error.message);
  process.exitCode = 1;
});