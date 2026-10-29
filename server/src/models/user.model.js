import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  DEFAULT_LOGGING_RULES,
  isValidLoggingRules,
} from "../config/loggingRules.js";

const userSchema = new mongoose.Schema(
  {
    loggingRules: {
      type: [String],
      default: () => [...DEFAULT_LOGGING_RULES],
      validate: {
        validator: isValidLoggingRules,
        message: "Select between one and four valid, unique logging rules.",
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
      required: function () {
        return !this.googleId;
      },
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  this.password = await bcrypt.hash(this.password, 12);
});

const User = mongoose.model("User", userSchema);

export default User;
