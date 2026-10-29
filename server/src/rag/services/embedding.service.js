import { GoogleGenAI } from "@google/genai";
import config from "../../config/config.js";

export const createEmbedding = async (text, isQuery = false) => {
  if (!config.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env.");
  }

  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Provide text to generate an embedding.");
  }

  const ai = new GoogleGenAI({
    apiKey: config.GEMINI_API_KEY,
    httpOptions: { timeout: 30000 },
  });

  const response = await ai.models.embedContent({
    model: config.EMBEDDING_MODEL,
    contents: isQuery
      ? `task: code retrieval | query: ${text}`
      : `title: none | text: ${text}`,
    config: {
      outputDimensionality: config.EMBEDDING_DIMENSIONS,
    },
  });

  const vector = response.embeddings?.[0]?.values;

  if (
    !Array.isArray(vector) ||
    vector.length !== config.EMBEDDING_DIMENSIONS ||
    !vector.every(Number.isFinite)
  ) {
    throw new Error("Embedding response has invalid dimensions or values.");
  }

  return vector;
};