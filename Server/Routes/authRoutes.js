import express from 'express'
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerificationOtp, verifyEmail } from '../Controllers/authControllers.js'
import { userAuth } from '../MiddleWare/userAuth.js';


const authRouter=express.Router()

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/send-verify-otp',userAuth,sendVerificationOtp);
authRouter.post('/verify-otp',userAuth,verifyEmail);
authRouter.post('/is-auth',userAuth,isAuthenticated);
authRouter.post('/send-reset-otp',sendResetOtp);
authRouter.post('/reset-password',resetPassword);


export default authRouter