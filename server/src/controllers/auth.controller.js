import { randomBytes, createHash } from "node:crypto";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Session from "../models/session.model.js";
import config from "../config/config.js";
import passport from "../config/passport.js";

const cookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

const hashToken = (token) => createHash("sha256").update(token).digest("hex");

const setAuthCookies = (res, session, refreshToken) => {
  const accessToken = jwt.sign({ sid: session.id }, config.JWT_SECRET, {
    subject: session.user.toString(),
    algorithm: "HS256",
    issuer: "logix",
    audience: "logix-client",
    expiresIn: "15m",
  });

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    expires: session.expiresAt,
  });
};

export const register = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
  });

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    user: { id: user.id, name: user.name, email: user.email },
  });
};

export const login = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  const { email, password } = req.body;
  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user?.password || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const refreshToken = randomBytes(32).toString("hex");

  const session = await Session.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  setAuthCookies(res, session, refreshToken);

  res.json({
    success: true,
    message: "Logged in successfully",
    user: { id: user.id, name: user.name, email: user.email },
  });
};

export const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
    return res.status(401).json({
      success: false,
      message: "Please log in again",
    });
  }

  const refreshToken = randomBytes(32).toString("hex");

  const session = await Session.findOneAndUpdate(
    {
      tokenHash: hashToken(token),
      expiresAt: { $gt: new Date() },
    },
    { $set: { tokenHash: hashToken(refreshToken) } },
    { new: true },
  );

  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Please log in again",
    });
  }

  const user = await User.findById(session.user).select("name email");

  if (!user) {
    await Session.deleteOne({ _id: session._id });

    return res.status(401).json({
      success: false,
      message: "Please log in again",
    });
  }

  setAuthCookies(res, session, refreshToken);

  res.json({
    success: true,
    message: "Session refreshed",
    user: { id: user.id, name: user.name, email: user.email },
  });
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (typeof refreshToken === "string" && /^[a-f0-9]{64}$/.test(refreshToken)) {
    await Session.deleteOne({ tokenHash: hashToken(refreshToken) });
  }

  if (req.cookies?.accessToken) {
    let payload;

    try {
      payload = jwt.verify(req.cookies.accessToken, config.JWT_SECRET, {
        algorithms: ["HS256"],
        issuer: "logix",
        audience: "logix-client",
        ignoreExpiration: true,
      });
    } catch (error) {
      if (
        !["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(
          error.name,
        )
      ) {
        throw error;
      }
    }

    if (
      typeof payload?.sid === "string" &&
      /^[a-f0-9]{24}$/i.test(payload.sid) &&
      typeof payload?.sub === "string" &&
      /^[a-f0-9]{24}$/i.test(payload.sub)
    ) {
      await Session.deleteOne({
        _id: payload.sid,
        user: payload.sub,
      });
    }
  }

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

export const getMe = (req, res) => {
  const { id, name, email } = req.user;

  res.json({
    success: true,
    user: { id, name, email },
  });
};

export const googleLogin = (req, res, next) => {
  if (Object.keys(req.query).length) {
    return res.status(400).json({
      success: false,
      message: "Start Google login without query parameters.",
    });
  }

  const state = randomBytes(32).toString("hex");

  const token = jwt.sign({ state }, config.JWT_SECRET, {
    algorithm: "HS256",
    issuer: "logix",
    audience: "logix-google-oauth",
    expiresIn: "10m",
  });

  res.cookie("googleOAuth", token, {
    ...cookieOptions,
    maxAge: 10 * 60 * 1000,
  });

  passport.authenticate("google", {
    session: false,
    scope: ["openid", "profile", "email"],
    prompt: "select_account",
    state,
  })(req, res, next);
};

export const googleCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    { session: false },
    async (error, user, info) => {
      if (error) return next(error);

      if (!user) {
        if (info?.code === "PASSWORD_LOGIN_REQUIRED") {
          return res.redirect(
            new URL("/auth/manual-login", config.CLIENT_URL).href,
          );
        }

        return res.status(401).json({
          success: false,
          message: info?.message || "Google login failed. Please try again.",
        });
      }

      try {
        const refreshToken = randomBytes(32).toString("hex");

        const session = await Session.create({
          user: user._id,
          tokenHash: hashToken(refreshToken),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        setAuthCookies(res, session, refreshToken);

        return res.redirect(new URL("/workspace", config.CLIENT_URL).href);
      } catch (error) {
        next(error);
      }
    },
  )(req, res, next);
};

const postAuth = async (path, body) => {
  const response = await fetch(`${API_URL}/api/auth${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(
      data?.errors?.[0]?.msg ||
        data?.errors?.[0]?.message ||
        data?.message ||
        "Unable to complete the request. Please try again.",
    );
  }

  return data;
};

export const loginUser = ({ email, password }) =>
  postAuth("/login", { email, password });

export const registerUser = ({ name, email, password }) =>
  postAuth("/register", { name, email, password });
