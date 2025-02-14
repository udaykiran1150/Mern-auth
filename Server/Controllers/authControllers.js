import bcrypt from 'bcryptjs'
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import userModel from '../Models/userModel.js';


export const register =async(req,res)=>
{
    const {name,email,password}=req.body;
    if(!name || !email || !password)
    {
        res.json({success:false,message:'details are missing'})
    }
    try
    {
        const existingUser= await userModel.findOne({email});

        if(existingUser)
        {
             return res.json({success:false,message:'user already exists'})
        }
        const hashedPassword= await bcrypt.hash(password,10);
        const user=new userModel({name,email,password:hashedPassword})
        await user.save();
    const token=jwt.sign({id:user._id},process.env.JWT_SECRETkEY,{expiresIn:'7d'});
    res.cookie('token',token,{
        httpOnly:true,
        secure:process.NODE_ENV==='production',
        sameSite:process.env.NODE_ENV==='production'?'none':'strict',
        maxAge:24*60*60*1000*7
    })

    }
    catch (err)
    {
        res.json({success:false,message:err.message})
    }
}