import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 255
    },
    content: {
        type: String,
        default: ""
    },
    path: {
        type: String,
        required: true,
        trim: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    language: {
        type: String,
        default: 'javascript',
        enum: [
            'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp',
            'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css',
            'scss', 'json', 'xml', 'yaml', 'markdown', 'sql', 'bash', 'plaintext'
        ]
    },
    size: {
        type: Number,
        default: 0
    },
    mimeType: {
        type: String,
        default: 'text/plain'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isDirectory: {
        type: Boolean,
        default: false
    },
    parentDirectory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        default: null
    },
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }],
    version: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better performance
FileSchema.index({ project: 1 });
FileSchema.index({ path: 1 });
FileSchema.index({ 'project': 1, 'path': 1 });
FileSchema.index({ createdBy: 1 });
FileSchema.index({ parentDirectory: 1 });

// Virtual for file extension
FileSchema.virtual('extension').get(function() {
    return this.name.split('.').pop().toLowerCase();
});

// Pre-save middleware to update size
FileSchema.pre('save', function(next) {
    this.size = this.content ? this.content.length : 0;
    next();
});

export default mongoose.model("File", FileSchema);