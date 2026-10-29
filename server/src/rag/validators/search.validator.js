import { body, validationResult } from "express-validator";

export const searchValidator = [
  body("query")
    .isString()
    .withMessage("Enter a search query.")
    .bail()
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage("Search query must contain 3 to 500 characters."),

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