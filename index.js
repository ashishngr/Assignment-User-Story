import express from 'express'; 
import cors from 'cors'; 
import dotenv from 'dotenv'; 
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import { connectRedis } from './config/redisDb.js';
import logger from './utils/logger.js';
import AuthRoutes from './routes/authRoutes.js';
import UserRouter from './routes/userRoute.js';

const app = express();
const PORT = process.env.PORT || 8080 ; 
dotenv.config(); 
app.use(cors()); 
app.use(bodyParser.json()); 
app.use(cookieParser()); 

//TODO : Databases connection setup 
connectDB() //MongoDB Connection 
connectRedis()//Redis Connection 

//TODO : Import Routes
app.use("/api/v1", AuthRoutes)
app.use("/api/v1", UserRouter); 



app.listen(PORT , ()=>{
    console.log(`SERVER IS UP AND RUNNING ON PORT : ${PORT}`);
}); 
