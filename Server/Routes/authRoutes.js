import express from 'express'
import { login, logout, register, sendVerificationOtp, verifyEmail } from '../Controllers/authControllers.js'
import { userAuth } from '../MiddleWare/userAuth.js';


const authRouter=express.Router()

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/send-verify-otp',userAuth,sendVerificationOtp);
authRouter.post('/verify-otp',userAuth,verifyEmail);


export default authRouter