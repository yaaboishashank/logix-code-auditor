import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import config from "./config/config.js";
import passport from "./config/passport.js";

import authRoutes from "./routes/auth.routes.js";
import scanRoutes from "./routes/scan.routes.js";
import paymentRoutes from "./payments/routes/payment.routes.js";

import { paymentWebhook } from "./payments/controllers/webhook.controller.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();

if (config.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
  }),
);

app.post(
  "/api/payments/webhook",
  express.raw({
    type: "application/json",
    limit: "100kb",
  }),
  paymentWebhook,
);

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/api/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  return res.status(connected ? 200 : 503).json({
    success: connected,
    app: "LOGIX",
    database: connected ? "connected" : "disconnected",
  });
});

app.use(errorHandler);

export default app;