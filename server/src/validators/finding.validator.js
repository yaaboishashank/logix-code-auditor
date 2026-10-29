import { body, param, validationResult } from "express-validator";

export const findingStatusValidator = [
  param("findingId")
    .isMongoId()
    .withMessage("Invalid finding ID."),

  body("status")
    .isString()
    .withMessage("Status must be a string.")
    .bail()
    .isIn(["open", "resolved", "ignored"])
    .withMessage("Invalid finding status."),

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