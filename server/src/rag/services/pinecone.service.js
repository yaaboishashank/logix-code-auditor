import { Pinecone } from "@pinecone-database/pinecone";
import config from "../../config/config.js";

export const getPineconeIndex = () => {
  if (
    !config.PINECONE_API_KEY ||
    !config.PINECONE_INDEX_NAME ||
    !config.PINECONE_INDEX_HOST
  ) {
    throw new Error("Pinecone settings are missing in .env.");
  }

  const pinecone = new Pinecone({
    apiKey: config.PINECONE_API_KEY,
  });

  return pinecone.index({
    name: config.PINECONE_INDEX_NAME,
    host: config.PINECONE_INDEX_HOST,
  });
};