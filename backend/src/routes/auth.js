import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendOtp,verifyOtp } from '../controllers/authController.js';


const router=express.Router();

//Public routes
router.post('/register',register);
router.post('/login',login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

//protected routes (require authentication)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;