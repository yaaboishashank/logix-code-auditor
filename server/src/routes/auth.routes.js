import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  refresh,
  googleLogin,
  googleCallback,
} from "../controllers/auth.controller.js";
import {
  registerValidator,
  loginValidator,
} from "../validators/auth.validator.js";
import {
  protect,
  checkOrigin,
  verifyGoogleState,
} from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

router.use((req, res, next) => {
  res.set({
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
  });

  next();
});

router.use(checkOrigin);

router.get("/google", authLimiter, googleLogin);

router.get("/google/callback", verifyGoogleState, authLimiter, googleCallback);

router.post("/register", authLimiter, registerValidator, register);
router.post("/login", authLimiter, loginValidator, login);
router.post("/refresh", authLimiter, refresh);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
