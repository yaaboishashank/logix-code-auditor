import {
  body,
  matchedData,
  validationResult,
} from "express-validator";

export const chatValidator = [
  body("message")
    .isString()
    .withMessage("Enter a message.")
    .bail()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message must contain 1–2000 characters."),

  body("findingId")
    .optional()
    .isMongoId()
    .withMessage("Invalid finding ID."),

  body("requestId")
    .isUUID(4)
    .withMessage("Invalid message request ID."),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    req.body = matchedData(req, { locations: ["body"] });
    next();
  },
];