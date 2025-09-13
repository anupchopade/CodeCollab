import dotenv from "dotenv";
dotenv.config();

// Debug: Check if environment variables are loaded
// console.log('Environment variables loaded:');
// console.log('PORT:', process.env.PORT);
// console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'NOT LOADED');
// console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'NOT LOADED');

import express from "express";
import cors from "cors";

import mongoose from "mongoose";
import connectDB from './src/config/database.js';
import authRoutes from './src/routes/auth.js';
import projectRoutes from './src/routes/projects.js';
import fileRoutes from './src/routes/files.js';
import http from "http";
import { Server } from "socket.io";
import { initSocket } from "./src/socket/socketHandler.js";
import { setSocketIO } from "./src/controllers/fileController.js";

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


//Socket code
const server = http.createServer(app);

// Initialize socket with the server
console.log("🔍 [DEBUG] Initializing socket server");
const io = initSocket(server);
console.log("🔍 [DEBUG] Socket server initialized:", io ? "YES" : "NO");

// Inject socket.io instance into file controller
console.log("🔍 [DEBUG] Injecting socket.io instance into file controller");
setSocketIO(io);
console.log("🔍 [DEBUG] Socket.io instance injected successfully");

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Socket.io server is ready`);
});

app.get('/',(req,res)=>{
    res.json({message:"Codecollab  API is running"});
});

// Test endpoint to check socket.io instance
app.get('/test-socket',(req,res)=>{
    res.json({
        message: "Socket test endpoint",
        socketAvailable: io ? "YES" : "NO"
    });
});

// Test endpoint to manually emit a file creation event
app.get('/test-emit',(req,res)=>{
    if (io) {
        // Emit to all connected clients
        io.emit('file:created', {
            file: {
                _id: 'test123',
                name: 'test-file.js',
                path: '/test-file.js',
                language: 'javascript',
                content: 'console.log("test");',
                size: 20,
                createdBy: 'test-user',
                createdAt: new Date()
            },
            projectId: '68c3f84749a2bf99102bba0a',
            createdBy: 'test-user'
        });
        res.json({message: "Test event emitted"});
    } else {
        res.json({message: "No socket.io instance"});
    }
});