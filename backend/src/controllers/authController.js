import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendMail } from "../utils/mailer.js";
import User from '../models/User.js'
import crypto from "crypto";
import Otp from '../models/Otp.js';
//Register a new user
export const register=async (req,res)=>{
    try{
        const {username,email,password}=req.body;
         
        //check if user already exists
        const existingUser=await User.findOne({$or:[{email},{username}]});
        if (existingUser){
            return res.status(400).json({message:'User with this email or username already exists'});
        }

        //hashing the password
        const saltRounds=12;
        const hashedPassword=await bcrypt.hash(password,saltRounds);

        //create user
        const user=new User({
            username,
            email,
            password:hashedPassword
        });
        await user.save();

        //generete JWT token
        const token=jwt.sign({userId:user._id},
            process.env.JWT_SECRET,
            {expiresIn:'7d'}
        );

        //Return user data (without password) and token
        res.status(201).json({
            message:'User registered successfully',
            token,
            user:{
                id:user._id,
                username:user.username,
                email:user.email,
                profile:user.profile,
            }
        });
    }catch(error){
        console.error('Registration error:',error);
        res.status(500).json({message:'Internal server error'});
    }
};


//Login User
export const login=async(req,res)=>{
    try{
        const {email,password}=req.body;

        //Find user by email
        const user=await User.findOne({email});
        if(!user){
            return res.status(401).json({message:'Invalid Credentials'});
        }

        //Check password
        const isPasswordValid=await bcrypt.compare(password,user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
          }

          //Generate JWT token
          const token=jwt.sign(
          {userId: user._id},
          process.env.JWT_SECRET,
          {expiresIn: '7d'}
          );

          //Return user data and token
          res.json({
            message:'Login successfull',
            token,
            user:{
                id:user._id,
                username:user.username,
                email:user.email,
                profile:user.profile
            }
          });
    }catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
};

//Get current user Profile
export const getProfile=async (req,res)=>{
    try{
        const user=await User.findById(req.user._id).select('-password');
        res.json({user});
    }catch(error){
        console.error('get profile error:',error);
        res.status(500).json({message:'Internal server error'});
    }
};
// Update user profile
export const updateProfile = async (req, res) => {
    try {
      const { username, bio, theme } = req.body;
      const userId = req.user._id;
  
      const updateData = {};
      if (username) updateData.username = username;
      if (bio !== undefined) updateData['profile.bio'] = bio;
      if (theme) updateData['profile.preferences.theme'] = theme;
  
      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
  
      res.json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };












  //OTP part
const hashOtp=(otp)=>{
    const secret=process.env.OTP_SECRET_SALT || '';
    return crypto.createHash('sha256').update(otp+secret).digest('hex');
}


  //Send OTP
 // Send OTP
export const sendOtp = async (req, res) => {
    try {
      let { email } = req.body;
      if (!email) return res.status(400).json({ error: "Email is required" });
  
      const normalizedEmail = email.toLowerCase().trim();
      const now = new Date();
      const existing = await Otp.findOne({ email: normalizedEmail });

      if (existing && now - existing.lastSent < 45 * 1000) {
        return res.status(429).json({ error: "Please wait 45s before requesting a new OTP" });
      }
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpHash = hashOtp(otp);

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await Otp.findOneAndUpdate(
        { email: normalizedEmail },
        { otpHash, attempts: 0, lastSent: now, expiresAt },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
  
      await sendMail(normalizedEmail, otp);
      res.json({ message: "OTP sent to email" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error sending OTP" });
    }
};


  //VERIFY OTP
export const verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const doc = await Otp.findOne({ email: normalizedEmail });

    if (!doc) {
      return res.status(400).json({ error: "OTP expired or not found" });
    }

    if (doc.expiresAt.getTime() < Date.now()) {
      await Otp.deleteOne({ email: normalizedEmail });
      return res.status(400).json({ error: "OTP expired" });
    }

    if (doc.attempts >= 5) {
      await Otp.deleteOne({ email: normalizedEmail });
      return res.status(429).json({ error: "Too many failed attempts. Request a new OTP." });
    }

    const providedHash = hashOtp(otp);
    if (doc.otpHash !== providedHash) {
      await Otp.updateOne(
        { email: normalizedEmail },
        { $inc: { attempts: 1 } }
      );
      return res.status(400).json({ error: "Invalid OTP" });
    }

    await Otp.deleteOne({ email: normalizedEmail });

    const token = jwt.sign(
      { email: normalizedEmail },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "OTP verified", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error verifying OTP" });
  }
};
  // ✅ Periodic cleanup for expired OTPs
// setInterval(() => {
//     const now = Date.now();
//     for (const [email, record] of otpStore.entries()) {
//       if (record.expires < now) {
//         otpStore.delete(email);
//       }
//     }
//   }, 5 * 60 * 1000);