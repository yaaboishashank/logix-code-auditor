import {
  body,
  param,
  validationResult,
} from "express-validator";

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

export const verifyPaymentValidator = [
  body("razorpay_order_id")
    .isString()
    .bail()
    .isLength({ max: 80 })
    .bail()
    .matches(/^order_[a-zA-Z0-9]+$/)
    .withMessage("Invalid order ID."),

  body("razorpay_payment_id")
    .isString()
    .bail()
    .isLength({ max: 80 })
    .bail()
    .matches(/^pay_[a-zA-Z0-9]+$/)
    .withMessage("Invalid payment ID."),

  body("razorpay_signature")
    .isString()
    .bail()
    .matches(/^[a-f0-9]{64}$/i)
    .withMessage("Invalid payment signature."),

  validate,
];

export const orderIdValidator = [
  param("orderId")
    .isString()
    .bail()
    .isLength({ max: 80 })
    .bail()
    .matches(/^order_[a-zA-Z0-9]+$/)
    .withMessage("Invalid order ID."),

  validate,
];