import mongoose from "mongoose";

const sourceFileSchema = new mongoose.Schema(
  {
    scan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scan",
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    sha: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    content: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

sourceFileSchema.index({ scan: 1, path: 1 }, { unique: true });

export default mongoose.model("SourceFile", sourceFileSchema);