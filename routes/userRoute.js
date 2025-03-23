import express from 'express'; 

import UserController from '../controllers/user.controller.js';
import validateUser from '../middleware/validate.middleware.js';

const UserRouter = express.Router(); 


UserRouter.post("forgot-password", validateUser, UserController.UpdatePassword); 
UserRouter.post("reset-password", validateUser,  UserController.ResetPassword); 

export default UserRouter; 
