import jwt from "jsonwebtoken"; 
import logger from "../utils/logger.js";

const AuthHelper = (payload) =>{
    try {
        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            {
                issuer: 'User',
                audience: 'User-Journay'
            }, { expiresIn: "1h" }
        )
        return token;
    } catch (error) {
        logger.warn(`Login failed: Incorrect password for user - ${usernameOrEmail}`);
        throw error
    }
}
export default AuthHelper; 