import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    path: { type: String, required: true },
    startLine: { type: Number, required: true },
    endLine: { type: Number, required: true },
  },
  { _id: false },
);

const chatTurnSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scan",
      required: true,
    },
    finding: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    question: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    answer: {
      type: String,
      required: true,
    },
    sources: {
      type: [sourceSchema],
      default: [],
    },
  },
  { timestamps: true },
);

chatTurnSchema.index({
  user: 1,
  scan: 1,
  finding: 1,
  createdAt: -1,
  _id: -1,
});

export default mongoose.model("ChatTurn", chatTurnSchema);