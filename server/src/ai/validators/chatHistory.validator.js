import { query, validationResult } from "express-validator";

export const chatHistoryValidator = [
  query("findingId")
    .optional()
    .isString()
    .withMessage("Invalid finding ID.")
    .bail()
    .isMongoId()
    .withMessage("Invalid finding ID."),

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