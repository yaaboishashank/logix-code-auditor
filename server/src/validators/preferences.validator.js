import { body, validationResult } from "express-validator";
import { isValidLoggingRules } from "../config/loggingRules.js";

export const loggingPreferencesValidator = [
  body("loggingRules")
    .custom(isValidLoggingRules)
    .withMessage("Select between one and four valid, unique logging rules."),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    next();
  },
];