import express from 'express'; 
import { body } from "express-validator";
import AuthController from '../controllers/auth.controller.js';


const AuthRoutes = express.Router(); 

const validateLogin = [
    body("usernameOrEmail").notEmpty().withMessage("Username or Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
];

AuthRoutes.post('/register', AuthController.registerUser); 
AuthRoutes.post("/login",validateLogin, AuthController.login);
AuthRoutes.post("/logout", AuthController.logout)

export default AuthRoutes; 

