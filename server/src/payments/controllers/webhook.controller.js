import config from "../../config/config.js";
import Payment from "../models/payment.model.js";

import {
  PAYMENT_MODE,
  paymentError,
  validSignature,
  confirmCapturedPayment,
} from "../services/payment.service.js";

import { sendPaymentError } from "./payment.controller.js";

export const paymentWebhook = async (req, res) => {
  try {
    if (!config.RAZORPAY_WEBHOOK_SECRET) {
      throw paymentError(
        "Payment webhook is not configured.",
        503,
      );
    }

    if (
      !Buffer.isBuffer(req.body) ||
      !validSignature(
        req.body,
        req.get("x-razorpay-signature"),
        config.RAZORPAY_WEBHOOK_SECRET,
      )
    ) {
      throw paymentError("Invalid webhook signature.");
    }

    let event;

    try {
      event = JSON.parse(req.body.toString("utf8"));
    } catch {
      throw paymentError("Invalid webhook JSON.");
    }

    if (event?.event !== "payment.captured") {
      return res.json({ success: true });
    }

    const entity = event.payload?.payment?.entity;

    if (
      typeof entity?.id !== "string" ||
      typeof entity?.order_id !== "string" ||
      !/^pay_[a-zA-Z0-9]+$/.test(entity.id) ||
      !/^order_[a-zA-Z0-9]+$/.test(entity.order_id)
    ) {
      throw paymentError("Invalid webhook payment.");
    }

    const payment = await Payment.findOne({
      mode: PAYMENT_MODE,
      orderId: entity.order_id,
    }).lean();

    if (!payment) {
      return res.json({ success: true });
    }

    const paid = await confirmCapturedPayment(
      payment,
      entity.id,
    );

    if (!paid) {
      throw paymentError(
        "Payment confirmation is pending.",
        503,
      );
    }

    return res.json({ success: true });
  } catch (error) {
    return sendPaymentError(res, error);
  }
};