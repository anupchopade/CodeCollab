import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken=async (req,res,next)=>{
    try{
        //getting token form header
        const authHeader=req.headers['authorization'];
        const token=authHeader && authHeader.split(' ')[1];//bearer token
        if(!token){
            return res.status(401).json({message:'No token provided'});
        }
        //verify tokennn
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        //get user from database
        const user=await User.findById(decoded.userId).select('-password');
        if(!user){
            return res.status(401).json({message:'Invalid token'});
        }

        // add user to request object
        req.user = user;
        next();

    }
    catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
};

//Middleware to check if user owns the resources
export const checkOwnership =(req,res,next)=>{
    const resourceOwnerId=req.params.userId || req.body.owner;
    if(req.user._id.toString() !== resourceOwnerId){
        return res.status(403).json({message:'Access denied'});
    }
    next();
};