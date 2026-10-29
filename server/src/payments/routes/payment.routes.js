import express from "express";
import { rateLimit } from "express-rate-limit";

import {
  protect,
  checkOrigin,
} from "../../middlewares/auth.middleware.js";

import {
  createOrder,
  getCredits,
  verifyPayment,
  syncPayment,
} from "../controllers/payment.controller.js";

import {
  verifyPaymentValidator,
  orderIdValidator,
} from "../validators/payment.validator.js";

const router = express.Router();

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => String(req.user.id),
  message: {
    success: false,
    message: "Too many payment requests. Try again later.",
  },
});

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

router.use(checkOrigin, protect);

router.get("/credits", getCredits);

router.post(
  "/orders",
  paymentLimiter,
  createOrder,
);

router.post(
  "/verify",
  paymentLimiter,
  verifyPaymentValidator,
  verifyPayment,
);

router.post(
  "/orders/:orderId/sync",
  paymentLimiter,
  orderIdValidator,
  syncPayment,
);

export default router;