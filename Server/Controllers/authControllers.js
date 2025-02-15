import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../Models/userModel.js";
import transporter from "../config/nodemailer.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  console.log(req.body);
  if (!name || !email || !password) {
    return res.json({ success: false, message: "details are missing" });
  }
  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "user already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRETkEY, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000 * 7,
    });


    const mailOptions={
      from :process.env.SENDER_EMAIL,
      to:email,
      subject:'welcome to my website',
      text:`Your account is created with id:${email}`

    }
        
    await transporter.sendMail(mailOptions)

    return res.json({success:true});
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Email and password required" });
  }
  try {
    let user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "no user found" });
    }
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRETkEY, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000 * 7,
    });

    return res.json({success:true});

  } catch (err) {
           return res.json({success:false,message:err.message})
  }
};

export const  logout=async (req,res)=>
{
    try{
         res.clearCookie('token',{
            httpOnly: true,
            secure: process.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
         })
         res.json({success:true,message:'user Loged out'});
    }
    catch(err){
        return res.json({success:false,message:err.message})
    }
}

export const  sendVerificationOtp =async(req ,res)=>
{        

     try{

     
             let {userId}=req.body;
             let user=await userModel.findById(userId);
             if(user.isAccountVerified)
             {
               res.json({success:true,message:"Account alredy verified"});
             }

             let otp = String(Math.floor(100000+(Math.random()*900000)));
             
             user.verifyOtp=otp;
             user.verifyOtpExpireAt= Date.now()*24*60*60*1000;
             await user.save();

             let mailOptions=
             {
               from :process.env.SENDER_EMAIL,
               to:user.email,
               subject:'Otp for your login',
               text:`your otp:${otp} for login`
             }
              await transporter.sendMail(mailOptions);
             
             return res.json({success:true,message:'otp send successfully'})
    }
    catch(err)
    {
       return  res.json({success:false,message:err.message})
    }
}

export const verifyEmail=async(req,res)=>
{
        let {userId,otp}=req.body;
        if(!userId || !otp)
        {
          return res.json({suceess:false,message:'missing details'});
        }
        try{
              let user= await userModel.findById(userId);
              if(!user)
              {
                return res.json({success:false,message:'no user found'});
              }
              if(user.verifyOtp==='' || user.verifyOtp!==otp)
              {
                 return res.json({success:false,message:'Invalid otp'});
              }

              if(user.verifyOtpExpireAt<Date.now())
              {
                return res.json({success:false,message:'otp is expired'})
              }
              
              user.isAccountVerified=true;
              user.verifyOtp='';
              user.verifyOtpExpireAt=0;
              await user.save()
              return res.json({success:true,message:'account verified successfully'})


        }catch(err)
        {
          return res.json({success:false,message:err.message})
        }

}

export const isAuthenticated=async(req,res)=>
{

  try {
    return res.json({success:true,message:'logged in '})
  } catch (error) {
    return res.json({success:false,message:error.message})
  }
}

export const sendResetOtp=async(req,res)=>
{
       let {email}=req.body;
       if(!email)
       {
         return res.json({success:false,message:'enter email'})
       }
       try {
            let user=await userModel.findOne({email});
            if(!user)
            {
              return res.json({success:false,message:'no user found'})
            }
            let otp= String(Math.floor(100000+ Math.random()*900000))
            let resetOtpExpiry=Date.now()+15*60*1000;
            user.resetOtp=otp;
            user.resetOtpExpireAt=resetOtpExpiry;
            await user.save();

            let mailOptions={
              from :process.env.SENDER_EMAIL,
              to:user.email,
              subject:'Otp for reset password',
              text:`Your password reset otp${otp}`
            }
            await transporter.sendMail(mailOptions)
            return res.json({success:true,message:'reset password otp sent successfully'})
            


       } catch (error) {
         return res.json({success:false,message:error.message})
       }
}

export const resetPassword=async(req,res)=>
{
        let {email,otp,newpassword}=req.body;
        if(!email || !otp || !newpassword)
        {
          return res.json({success:false,mesage:'email ,otp and new password are required'});
        }
        try {
            let user=await userModel.findOne({email});
            if(!user)
            {
              return res.json({success:false,mesage:'no user found'});
            }
            if(user.resetOtp===''|| user.resetOtp!==otp)
            {
               return res.json({success:false,message:'Invalid OTP'})
            }
            if(user.resetOtpExpireAt< Date.now())
            {
              return res.json({success:false,message:'otp expired'})
            }

            let hashedPassword=await bcrypt.hash(newpassword,10);
            user.password=hashedPassword;

            user.resetOtp=''
            user.resetOtpExpireAt=0;
             await user.save();

             return res.json({success:true,mesage:'password reset successfully'})
        } catch (error) {
           return res.json({success:false,message:error.message})
        }
}