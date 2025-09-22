import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendMail } from "../utils/mailer.js";
import User from '../models/User.js'
import crypto from "crypto";
import Otp from '../models/Otp.js';
import LoginSession from '../models/LoginSession.js';

// Shared helper: issue OTP for a given email, enforce cooldown, and send mail
const issueOtpForEmail = async (rawEmail) => {
  const normalizedEmail = rawEmail.toLowerCase().trim();
  const now = new Date();
  const existing = await Otp.findOne({ email: normalizedEmail });

  // 45s cooldown
  if (existing && now - existing.lastSent < 45 * 1000) {
    const err = new Error("Please wait 45s before requesting a new OTP");
    err.status = 429;
    throw err;
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
  return { email: normalizedEmail };
};

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

        //create user with emailVerified=false by default
        const user=new User({
            username,
            email,
            password:hashedPassword,
            emailVerified: false
        });
        await user.save();

        // create short-lived session for OTP verification (reuse login flow)
        const sessionId = crypto.randomUUID();
        await LoginSession.create({
            sessionId,
            userId: user._id,
            email: user.email,
            type: 'register',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            used: false
        });

        try {
            // send OTP to user's email
            await issueOtpForEmail(user.email);
        } catch (sendErr) {
            // rollback: delete created user and session if sending failed
            try { await LoginSession.deleteOne({ sessionId }); } catch {}
            try { await User.findByIdAndDelete(user._id); } catch {}
            throw sendErr;
        }

        // respond indicating OTP is required (no JWT yet)
        return res.status(201).json({
            message: 'OTP sent to email',
            otpRequired: true,
            sessionId,
            email: user.email
        });
    }catch(error){
        console.error('Registration error:',error);
        const status = error.status || 500;
        res.status(status).json({message: error.message || 'Internal server error'});
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

              // Create a short-lived login session (10 minutes)
    const sessionId = crypto.randomUUID();
    await LoginSession.create({
      sessionId,
      userId: user._id,
      email: user.email,
      type: 'login',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      used: false
    });
    await issueOtpForEmail(user.email);

          //Generate JWT token
          // const token=jwt.sign(
          // {userId: user._id},
          // process.env.JWT_SECRET,
          // {expiresIn: '7d'}
          // );

          // //Return user data and token
          // res.json({
          //   message:'Login successfull',
          //   token,
          //   user:{
          //       id:user._id,
          //       username:user.username,
          //       email:user.email,
          //       profile:user.profile
          //   }
          // });

          return res.json({
            message: 'OTP sent to email',
            otpRequired: true,
            sessionId,
            email: user.email
          });
    }catch (error) {
        console.error('Login error:', error);
        const status = error.status || 500;
        res.status(status).json({ message: 'Internal server error' });
      }
};

// Forgot Password - request OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      // Prevent user enumeration: respond success without indicating existence
      return res.json({ message: 'If the email exists, an OTP has been sent' });
    }

    const sessionId = crypto.randomUUID();
    await LoginSession.create({
      sessionId,
      userId: user._id,
      email: user.email,
      type: 'password-reset',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      used: false
    });

    await issueOtpForEmail(user.email);

    return res.json({
      message: 'OTP sent to email',
      otpRequired: true,
      sessionId,
      email: user.email
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    const status = error.status || 500;
    return res.status(status).json({ message: error.message || 'Internal server error' });
  }
};

// Reset Password using sessionId + OTP + new password
export const resetPassword = async (req, res) => {
  try {
    const { sessionId, otp, newPassword } = req.body || {};
    if (!sessionId || !otp || !newPassword) {
      return res.status(400).json({ message: 'sessionId, OTP and newPassword are required' });
    }

    const session = await LoginSession.findOne({ sessionId });
    if (!session) return res.status(400).json({ message: 'Invalid session' });
    if (session.used) return res.status(400).json({ message: 'Session already used' });
    if (session.expiresAt.getTime() < Date.now()) return res.status(400).json({ message: 'Session expired' });
    if (session.type !== 'password-reset') return res.status(400).json({ message: 'Invalid session type' });

    const doc = await Otp.findOne({ email: session.email });
    if (!doc) return res.status(400).json({ message: 'OTP expired or not found' });
    if (doc.expiresAt.getTime() < Date.now()) {
      await Otp.deleteOne({ email: session.email });
      return res.status(400).json({ message: 'OTP expired' });
    }
    if (doc.attempts >= 5) {
      await Otp.deleteOne({ email: session.email });
      return res.status(429).json({ message: 'Too many failed attempts. Request a new OTP.' });
    }

    const providedHash = hashOtp(otp);
    if (doc.otpHash !== providedHash) {
      await Otp.updateOne({ email: session.email }, { $inc: { attempts: 1 } });
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP ok → update password, cleanup
    const user = await User.findById(session.userId);
    if (!user) return res.status(400).json({ message: 'User not found' });

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    await user.save();

    await Otp.deleteOne({ email: session.email });
    session.used = true;
    await session.save();

    // Optionally sign user in after reset
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Password reset successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    const status = error.status || 500;
    return res.status(status).json({ message: error.message || 'Internal server error' });
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
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email is required" });

    await issueOtpForEmail(email);
    return res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || "Error sending OTP" });
  }
};


  //VERIFY OTP
  export const verifyOtp = async (req, res) => {
    try {
      const { sessionId, otp } = req.body;
      if (!sessionId || !otp) {
        return res.status(400).json({ error: "sessionId and OTP are required" });
      }
  
      const session = await LoginSession.findOne({ sessionId });
      if (!session) {
        return res.status(400).json({ error: "Invalid session" });
      }
      if (session.used) {
        return res.status(400).json({ error: "Session already used" });
      }
      if (session.expiresAt.getTime() < Date.now()) {
        return res.status(400).json({ error: "Session expired" });
      }
  
      const doc = await Otp.findOne({ email: session.email });
      if (!doc) {
        return res.status(400).json({ error: "OTP expired or not found" });
      }
      if (doc.expiresAt.getTime() < Date.now()) {
        await Otp.deleteOne({ email: session.email });
        return res.status(400).json({ error: "OTP expired" });
      }
      if (doc.attempts >= 5) {
        await Otp.deleteOne({ email: session.email });
        return res.status(429).json({ error: "Too many failed attempts. Request a new OTP." });
      }
  
      const providedHash = hashOtp(otp);
      if (doc.otpHash !== providedHash) {
        await Otp.updateOne({ email: session.email }, { $inc: { attempts: 1 } });
        return res.status(400).json({ error: "Invalid OTP" });
      }
  
      // OTP ok → clean up and issue real JWT with userId
      await Otp.deleteOne({ email: session.email });
      session.used = true;
      await session.save();
  
      const user = await User.findById(session.userId);
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }
      // mark email as verified on successful OTP (covers both register and login flows)
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }
  
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
  
      return res.json({
        message: "OTP verified",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Error verifying OTP" });
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