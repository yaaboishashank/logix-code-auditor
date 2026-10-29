import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import config from "../config/config.js";

export const checkOrigin = (req, res, next) => {
  const origin = req.get("origin");

  if (origin && origin !== config.CLIENT_URL) {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  next();
};

export const protect = async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Please log in",
    });
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "logix",
      audience: "logix-client",
    });

    if (
      typeof payload.sub !== "string" ||
      !/^[a-f0-9]{24}$/i.test(payload.sub) ||
      typeof payload.sid !== "string" ||
      !/^[a-f0-9]{24}$/i.test(payload.sid)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid session",
      });
    }

    const session = await Session.exists({
      _id: payload.sid,
      user: payload.sub,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please log in again",
      });
    }

    const user = await User.findById(payload.sub).select("name email");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Please log in again",
      });
    }

    req.user = user;
    res.set("Cache-Control", "no-store");
    next();
  } catch (error) {
    if (
      ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(
        error.name,
      )
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    next(error);
  }
};

export const verifyGoogleState = (req, res, next) => {
  res.clearCookie("googleOAuth", {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  try {
    const payload = jwt.verify(req.cookies?.googleOAuth, config.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "logix",
      audience: "logix-google-oauth",
    });

    if (
      typeof req.query.state !== "string" ||
      payload.state !== req.query.state
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google login request. Start again.",
      });
    }
  } catch (error) {
    if (
      !["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(
        error.name,
      )
    ) {
      return next(error);
    }

    console.log("Google OAuth debug:", {
      cookieReceived: Boolean(req.cookies?.googleOAuth),
      error: error.name,
      message: error.message,
    });

    return res.status(401).json({
      success: false,
      message: "Google login expired or invalid. Start again.",
    });
  }

  if (
    req.query.error ||
    typeof req.query.code !== "string" ||
    !req.query.code
  ) {
    return res.status(400).json({
      success: false,
      message: "Google login cancelled or incomplete. Start again.",
    });
  }

  next();
};
