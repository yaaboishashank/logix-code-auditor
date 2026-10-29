import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mode: {
      type: String,
      enum: ["test", "live"],
      required: true,
    },
    credits: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

walletSchema.index(
  { user: 1, mode: 1 },
  { unique: true },
);

export default mongoose.model("Wallet", walletSchema);