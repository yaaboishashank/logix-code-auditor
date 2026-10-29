import { body, param, validationResult } from "express-validator";

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  next();
};

export const createScanValidator = [
  body("repositoryUrl")
    .isString()
    .withMessage("Repository URL is required.")
    .bail()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Repository URL is too long.")
    .bail()
    .matches(
      /^https:\/\/github\.com\/[a-z\d-]+\/(?!\.{1,2}\/?$)[a-z\d_.-]+\/?$/i
    )
    .withMessage("Use a repository URL: https://github.com/owner/repository"),

  body("branch")
    .optional()
    .isString()
    .withMessage("Branch must be text.")
    .bail()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Branch name is too long.")
    .bail()
    .custom((value) => !/\s/.test(value))
    .withMessage("Branch name cannot contain spaces."),

  validate,
];

export const scanIdValidator = [
  param("scanId")
    .isMongoId()
    .withMessage("Invalid scan ID."),

  validate,
];