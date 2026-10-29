import config from "../../config/config.js";

import {
  PAYMENT_MODE,
  CHAT_PACK,
  createChatOrder,
  getCreditBalance,
  verifyChatPayment,
  syncChatPayment,
} from "../services/payment.service.js";

export const sendPaymentError = (res, error) => {
  console.error(
    "Payment error:",
    error.code || error.statusCode || error.name,
  );

  return res
    .status(error.publicMessage ? error.statusCode : 502)
    .json({
      success: false,
      message:
        error.publicMessage ||
        "Payment could not be confirmed. Check its status before paying again.",
    });
};

export const createOrder = async (req, res) => {
  try {
    const payment = await createChatOrder(req.user.id);

    return res.status(201).json({
      success: true,
      mode: PAYMENT_MODE,
      keyId: config.RAZORPAY_KEY_ID,
      order: {
        id: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
      },
      credits: payment.credits,
    });
  } catch (error) {
    return sendPaymentError(res, error);
  }
};

export const getCredits = async (req, res) => {
  try {
    return res.json({
      success: true,
      mode: PAYMENT_MODE,
      credits: await getCreditBalance(req.user.id),
      pack: CHAT_PACK,
    });
  } catch (error) {
    return sendPaymentError(res, error);
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const paid = await verifyChatPayment(
      req.user.id,
      req.body,
    );

    return res.status(paid ? 200 : 202).json({
      success: true,
      paymentStatus: paid ? "paid" : "pending",
      credits: await getCreditBalance(req.user.id),
    });
  } catch (error) {
    return sendPaymentError(res, error);
  }
};

export const syncPayment = async (req, res) => {
  try {
    const paid = await syncChatPayment(
      req.user.id,
      req.params.orderId,
    );

    return res.status(paid ? 200 : 202).json({
      success: true,
      paymentStatus: paid ? "paid" : "pending",
      credits: await getCreditBalance(req.user.id),
    });
  } catch (error) {
    return sendPaymentError(res, error);
  }
};