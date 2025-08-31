import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100
    },
    description: {
        type: String,
        maxlength: 500,
        default: ""
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    collaborators: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['viewer', 'editor', 'admin'],
            default: 'editor'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    files: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }],
    settings: {
        isPublic: {
            type: Boolean,
            default: false
        },
        allowForking: {
            type: Boolean,
            default: true
        },
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'auto'
        },
        language: {
            type: String,
            default: 'javascript'
        }
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 20
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ 'collaborators.user': 1 });
ProjectSchema.index({ isPublic: 1 });
ProjectSchema.index({ tags: 1 });

export default mongoose.model("Project", ProjectSchema);