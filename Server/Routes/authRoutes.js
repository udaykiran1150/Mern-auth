import express from 'express'
import { login, logout, register } from '../Controllers/authControllers.js'


const authRouter=express.Router()

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);

export default authRouter