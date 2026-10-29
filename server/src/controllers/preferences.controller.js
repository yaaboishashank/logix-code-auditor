import User from "../models/user.model.js";
import { DEFAULT_LOGGING_RULES } from "../config/loggingRules.js";

export const getLoggingPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select("loggingRules")
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Please log in again.",
      });
    }

    return res.json({
      success: true,
      loggingRules: user.loggingRules ?? DEFAULT_LOGGING_RULES,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLoggingPreferences = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          loggingRules: req.body.loggingRules,
        },
      },
      { new: true, runValidators: true },
    )
      .select("loggingRules")
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Please log in again.",
      });
    }

    return res.json({
      success: true,
      loggingRules: user.loggingRules,
    });
  } catch (error) {
    next(error);
  }
};