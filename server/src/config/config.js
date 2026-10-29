import dotenv from "dotenv";

dotenv.config();

const config = {
  PORT: Number(process.env.PORT) || 3000,
  MONGO_URI: process.env.MONGO_URI,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  NODE_ENV: process.env.NODE_ENV || "development",

  JWT_SECRET: process.env.JWT_SECRET,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,

  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || "gemini-embedding-2",
  EMBEDDING_DIMENSIONS: Number(process.env.EMBEDDING_DIMENSIONS || 768),

  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
  PINECONE_INDEX_HOST: process.env.PINECONE_INDEX_HOST,

  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ANALYSIS_MODEL: process.env.ANALYSIS_MODEL || "claude-haiku-5-5",

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
};

if (!config.JWT_SECRET || config.JWT_SECRET.length < 64) {
  throw new Error(
    "Set JWT_SECRET in .env to your generated 64-character secret",
  );
}

if (
  !config.GOOGLE_CLIENT_ID ||
  !config.GOOGLE_CLIENT_SECRET ||
  !config.GOOGLE_CALLBACK_URL
) {
  throw new Error("Google OAuth credentials are missing in .env");
}

export default config;