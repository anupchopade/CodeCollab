import dotenv from "dotenv";
dotenv.config();

// Debug: Check if environment variables are loaded
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'NOT LOADED');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'NOT LOADED');

import express from "express";
import cors from "cors";

import mongoose from "mongoose";
import connectDB from './src/config/database.js';
import authRoutes from './src/routes/auth.js';
import projectRoutes from './src/routes/projects.js';
import fileRoutes from './src/routes/files.js';


const app=express();
const PORT=process.env.PORT || 5000;

//Databse connection
//connect to database
connectDB();

// Middleware 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/files', fileRoutes); 

app.get('/',(req,res)=>{
    res.json({message:"Codecollab  API is running"});
});

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});