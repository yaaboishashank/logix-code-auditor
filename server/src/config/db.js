import mongoose from "mongoose";
import config from "./config.js";

const connectToDatabase = async () => {
  if (!config.MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env");
  }

  await mongoose.connect(config.MONGO_URI);
  console.log("MongoDB connected");
};

export default connectToDatabase;
