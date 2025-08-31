import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    socketId: {
        type: String,
        required: true,
        unique: true
    },
    activeFile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        default: null
    },
    cursorPosition: {
        line: {
            type: Number,
            default: 1
        },
        column: {
            type: Number,
            default: 1
        }
    },
    selection: {
        startLine: {
            type: Number,
            default: 1
        },
        startColumn: {
            type: Number,
            default: 1
        },
        endLine: {
            type: Number,
            default: 1
        },
        endColumn: {
            type: Number,
            default: 1
        }
    },
    status: {
        type: String,
        enum: ['online', 'away', 'offline'],
        default: 'online'
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    userAgent: {
        type: String,
        default: ""
    },
    ipAddress: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better performance
SessionSchema.index({ user: 1 });
SessionSchema.index({ project: 1 });
SessionSchema.index({ socketId: 1 });
SessionSchema.index({ 'project': 1, 'isActive': 1 });
SessionSchema.index({ lastActivity: 1 });

// Pre-save middleware to update lastActivity
SessionSchema.pre('save', function(next) {
    this.lastActivity = new Date();
    next();
});

// Static method to find active sessions in a project
SessionSchema.statics.findActiveInProject = function(projectId) {
    return this.find({
        project: projectId,
        isActive: true,
        status: { $ne: 'offline' }
    }).populate('user', 'username email profile.avatar');
};

// Static method to find user's active sessions
SessionSchema.statics.findUserSessions = function(userId) {
    return this.find({
        user: userId,
        isActive: true
    }).populate('project', 'name description');
};

// Instance method to update cursor position
SessionSchema.methods.updateCursor = function(line, column) {
    this.cursorPosition = { line, column };
    this.lastActivity = new Date();
    return this.save();
};

// Instance method to update selection
SessionSchema.methods.updateSelection = function(startLine, startColumn, endLine, endColumn) {
    this.selection = {
        startLine,
        startColumn,
        endLine,
        endColumn
    };
    this.lastActivity = new Date();
    return this.save();
};

export default mongoose.model("Session", SessionSchema);