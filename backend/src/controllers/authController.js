import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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