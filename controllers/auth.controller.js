import User from "../models/userSchema.js";
import winston from "../utils/logger.js";
import AuthHelper from "../middleware/auth.middleware.js";
import { redisClient } from "../config/redisDb.js";
import { validationResult } from "express-validator";
import logger from "../utils/logger.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; 


const AuthController = {};

/**
 * @desc Register a new user
 * @route POST /api/v1/register
 * @access Public
 */
AuthController.registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      winston.warn("Validation failed", { errors: errors.array() });
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { firstName, lastName, username, email, password, address } =
      req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      winston.warn("User already exists", { email, username });
      return res
        .status(400)
        .json({ success: false, message: "Email or username already in use." });
    }
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password,
      address,
    });
    const savedUser = await newUser.save();
    winston.info("User registered successfully", {
      userId: savedUser._id,
      email,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        username: savedUser.username,
        email: savedUser.email,
      },
    });
  } catch (error) {
    winston.error("User registration failed", { error: error.message });
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
/**
 * @desc Login a user
 * @route POST /api/v1/login
 * @access Public
 */
AuthController.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { usernameOrEmail, password } = req.body;
    const loginUser = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
    if (!loginUser) {
      logger.warn(`Login failed: Invalid username/email - ${usernameOrEmail}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, loginUser.password);
    if (!isMatch) {
      logger.warn(
        `Login failed: Incorrect password for user - ${usernameOrEmail}`
      );
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const payload = {
      user: {
        id: loginUser.id,
        email: loginUser.email,
      },
    };
    const accessToken = AuthHelper(payload);
    await redisClient.set(`session:${loginUser._id}`, accessToken, {
      EX: 3600,
    });
    logger.info(`User logged in: ${loginUser.username}`);
    return res.status(200).json({
      access_token: accessToken,
      message: "User login successfully",
    });
  } catch (error) {
    winston.error("User registration failed", { error: error.message });
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
/**
 * @desc logout a user
 * @route POST /api/v1/logout
 * @access Public
 */
AuthController.logout = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    console.log("Auth Header:", authHeader);
    if (!authHeader) {
      return res.status(400).json({ message: "No token provided" });
    }
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;
    console.log("Extracted Token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.user.id;
    const sessionKey = `session:${userId}`;
    const sessionExists = await redisClient.exists(sessionKey);

    if (sessionExists) {
      await redisClient.del(sessionKey);
      logger.info(`User logged out: ${decoded.user.email}`);
    }
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default AuthController;
