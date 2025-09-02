import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from './src/config/database.js';
import authRoutes from './src/routes/auth.js';
import projectRoutes from './src/routes/projects.js';
import fileRoutes from './src/routes/files.js';

dotenv.config();
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