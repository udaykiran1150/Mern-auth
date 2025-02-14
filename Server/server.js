import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import 'dotenv/config'
let port=process.env.PORT||5000;

import connectDb from './config/mongodb.js'
let hostname='127.0.0.1'
let app=express();
connectDb()

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials:true}))
app.get('/',(req,res)=>
{
    res.send("API working")
})
app.listen(port,hostname,()=>
{
    console.log(`Server at http://${hostname}:${port}`)
})