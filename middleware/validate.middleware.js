import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

const validateUser = (req, res, next) => {
    const authHeader = req.header("Authorization");
  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Unauthorized access attempt: No token provided");
      return res.status(401).json({ message: "Unauthorized access" });
    }
  
    const token = authHeader.split(" ")[1];
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user; // Attach user info to request object
      next(); // Proceed to the next middleware/controller
    } catch (error) {
      logger.error("Invalid token detected", { error: error.message });
      return res.status(401).json({ message: "Invalid token, please log in again" });
    }
  };
  
  export default validateUser;