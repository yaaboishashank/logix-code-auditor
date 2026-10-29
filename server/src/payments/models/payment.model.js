import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
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
    orderId: {
      type: String,
      required: true,
    },
    paymentId: String,
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    credits: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["created", "paid"],
      default: "created",
    },
    paidAt: Date,
  },
  { timestamps: true },
);

paymentSchema.index(
  { mode: 1, orderId: 1 },
  { unique: true },
);

paymentSchema.index({
  user: 1,
  mode: 1,
  createdAt: -1,
});

export default mongoose.model("Payment", paymentSchema);