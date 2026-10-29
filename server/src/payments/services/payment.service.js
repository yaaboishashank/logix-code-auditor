import Razorpay from "razorpay";
import mongoose from "mongoose";
import {
  createHmac,
  timingSafeEqual,
  randomUUID,
} from "node:crypto";

import config from "../../config/config.js";
import Payment from "../models/payment.model.js";
import Wallet from "../models/wallet.model.js";

export const PAYMENT_MODE = "test";

export const CHAT_PACK = {
  amount: 100,
  currency: "INR",
  credits: 5,
};

export const paymentError = (message, statusCode = 400) => {
  const error = new Error(message);

  error.statusCode = statusCode;
  error.publicMessage = message;

  return error;
};

const getRazorpay = () => {
  if (
    !config.RAZORPAY_KEY_ID?.startsWith("rzp_test_") ||
    !config.RAZORPAY_KEY_SECRET ||
    config.RAZORPAY_KEY_SECRET === "your_test_key_secret"
  ) {
    throw paymentError(
      "Configure valid Razorpay Test Mode keys.",
      503,
    );
  }

  return new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET,
  });
};

export const validSignature = (body, signature, secret) => {
  if (
    !secret ||
    typeof signature !== "string" ||
    !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(body)
    .digest();

  return timingSafeEqual(
    expected,
    Buffer.from(signature, "hex"),
  );
};

export const getCreditBalance = async (userId) => {
  const wallet = await Wallet.findOne({
    user: userId,
    mode: PAYMENT_MODE,
  }).lean();

  return wallet?.credits ?? 0;
};

export const createChatOrder = async (userId) => {
  const razorpay = getRazorpay();

  await Promise.all([
    Payment.init(),
    Wallet.init(),
  ]);

  try {
    await Wallet.updateOne(
      {
        user: userId,
        mode: PAYMENT_MODE,
      },
      {
        $setOnInsert: { credits: 0 },
      },
      { upsert: true },
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
  }

  const order = await razorpay.orders.create({
    amount: CHAT_PACK.amount,
    currency: CHAT_PACK.currency,
    receipt: randomUUID(),
    partial_payment: false,
  });

  if (
    typeof order.id !== "string" ||
    order.amount !== CHAT_PACK.amount ||
    order.currency !== CHAT_PACK.currency
  ) {
    throw paymentError(
      "Unexpected payment order response.",
      502,
    );
  }

  return Payment.create({
    user: userId,
    mode: PAYMENT_MODE,
    orderId: order.id,
    ...CHAT_PACK,
  });
};

const getOwnedPayment = async (userId, orderId) => {
  const payment = await Payment.findOne({
    user: userId,
    mode: PAYMENT_MODE,
    orderId,
  }).lean();

  if (!payment) {
    throw paymentError("Payment order not found.", 404);
  }

  return payment;
};

export const confirmCapturedPayment = async (
  payment,
  paymentId,
) => {
  const details = await getRazorpay().payments.fetch(paymentId);

  if (
    details.id !== paymentId ||
    details.order_id !== payment.orderId ||
    details.amount !== payment.amount ||
    details.currency !== payment.currency
  ) {
    throw paymentError(
      "Payment does not match the saved order.",
    );
  }

  if (
    details.status === "refunded" ||
    details.amount_refunded > 0
  ) {
    throw paymentError(
      "This payment has been refunded.",
      409,
    );
  }

  if (
    details.status !== "captured" ||
    details.captured !== true
  ) {
    return false;
  }

  await Promise.all([
    Payment.init(),
    Wallet.init(),
  ]);

  await mongoose.connection.transaction(async (session) => {
    const claimed = await Payment.updateOne(
      {
        _id: payment._id,
        mode: PAYMENT_MODE,
        status: "created",
      },
      {
        $set: {
          status: "paid",
          paymentId,
          paidAt: new Date(),
        },
      },
      { session },
    );

    if (!claimed.matchedCount) {
      const existing = await Payment.findOne({
        _id: payment._id,
        mode: PAYMENT_MODE,
        status: "paid",
      }).session(session);

      if (!existing) {
        throw paymentError(
          "Payment record changed. Retry verification.",
          409,
        );
      }

      return;
    }

    const wallet = await Wallet.updateOne(
      {
        user: payment.user,
        mode: PAYMENT_MODE,
      },
      {
        $inc: { credits: payment.credits },
      },
      { session },
    );

    if (!wallet.matchedCount) {
      throw new Error("Payment wallet is missing.");
    }
  });

  return true;
};

export const verifyChatPayment = async (userId, body) => {
  const payment = await getOwnedPayment(
    userId,
    body.razorpay_order_id,
  );

  const valid = validSignature(
    `${payment.orderId}|${body.razorpay_payment_id}`,
    body.razorpay_signature,
    config.RAZORPAY_KEY_SECRET,
  );

  if (!valid) {
    throw paymentError("Invalid payment signature.");
  }

  return confirmCapturedPayment(
    payment,
    body.razorpay_payment_id,
  );
};

export const syncChatPayment = async (userId, orderId) => {
  const payment = await getOwnedPayment(userId, orderId);

  const result = await getRazorpay().orders.fetchPayments(
    payment.orderId,
  );

  const captured = result.items?.find(
    (item) => item.status === "captured",
  );

  if (!captured) return false;

  return confirmCapturedPayment(payment, captured.id);
};