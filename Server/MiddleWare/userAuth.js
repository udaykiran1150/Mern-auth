import jwt from 'jsonwebtoken'

export const userAuth=async (req,res,next)=>
{
    let {token}=req.cookies;
    if(!token)
    {
        return res.json({success:false,message:'not authorized login again'});

    }
    try {
        const decodeToken=jwt.verify(token,process.env.JWT_SECRETkEY);
        if(decodeToken.id)
        {
            req.body.userId=decodeToken.id;
        }
        else
        {
            return res.json({success:false,message:'not authorized login again'});
        }
        next();
        
    } catch (error) {
        return res.json({success:false,message:error.message})
    }
    

}