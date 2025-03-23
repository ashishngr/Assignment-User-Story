import winston from "../utils/logger.js";
import AuthHelper from "../middleware/auth.middleware.js";
import { validationResult } from "express-validator";
import logger from "../utils/logger.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import sendEmail from "../utils/emailUtils.js";
import User from "../models/userSchema.js";

/**
 * @desc Request a password reset (Sends email with JWT token)
 * @route POST /api/v1/auth/forgot-password
 * @access Private
 */

const UserController = {};
UserController.UpdatePassword = async (req, res) => {
  try {
    const { email } = req.body;
    const data = await User.findOne({ email });
    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }
    const payload = {
      user: {
        id: data.id,
      },
    };
    const resetToken = AuthHelper(payload);
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail(
      data.email,
      "Password Reset Request",
      `Click here to reset your password: ${resetUrl}`
    );
    logger.info(`Password reset email sent to ${user.email}`);
    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {}
};
/**
 * @desc Reset password
 * @route POST /api/v1/auth/reset-password/:token
 * @access Private
 */
UserController.ResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    user.password = newPassword;
    await user.save();

    logger.info(`Password reset successful for ${user.email}`);
    res
      .status(200)
      .json({ message: "Password reset successful, you can now log in" });
  } catch (error) {
    logger.error("Reset password error", { error: error.message });
    res.status(500).json({ message: "Invalid or expired token" });
  }
};

export default UserController;
