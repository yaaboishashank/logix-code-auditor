import mongoose from "mongoose";

const chatUsageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mode: {
      type: String,
      required: true,
    },
    requestId: {
      type: String,
      required: true,
    },
    fingerprint: {
      type: String,
      required: true,
    },
    turn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatTurn",
      required: true,
    },
  },
  { timestamps: true }
);

chatUsageSchema.index(
  { user: 1, mode: 1, requestId: 1 },
  { unique: true }
);

export default mongoose.model("ChatUsage", chatUsageSchema);