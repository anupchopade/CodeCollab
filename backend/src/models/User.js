import mongoose from "mongoose";

const UserSchema=new mongoose.Schema({
    username: {
        type: String, 
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profile: {
        avatar: {
            type: String,
            default: null
        },
        bio: {
            type: String,
            maxlength: 500,
            default: ""
        },
        preferences: {
            theme: {
                type: String,
                enum: ['light', 'dark'],
                default: 'light'
            },
            language: {
                type: String,
                default: 'en'
            }
        }
    },
    createdProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    joinedProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    isActive: {
        type: Boolean,
        default: true
    }

},{timestamps:true});
UserSchema.index({ email: 1, username: 1 });

export default mongoose.model("User",UserSchema);