import { body } from "express-validator";

export const registerValidator = [
  body("name")
    .isString().withMessage("Name is required").bail()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage("Name must be 2–60 characters"),

  body("email")
    .isString().withMessage("Email is required").bail()
    .trim()
    .isEmail().withMessage("Enter a valid email address"),

  body("password")
    .isString().withMessage("Password is required").bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters").bail()
    .custom((value) => Buffer.byteLength(value, "utf8") <= 72)
    .withMessage("Password must not exceed 72 bytes"),
];

export const loginValidator = [
  body("email").isString().withMessage("Email is required").bail()
    .trim().isEmail().withMessage("Enter a valid email address"),

  body("password").isString().withMessage("Password is required").bail()
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters").bail()
    .custom((value) => Buffer.byteLength(value, "utf8") <= 72)
    .withMessage("Password must not exceed 72 bytes"),
];