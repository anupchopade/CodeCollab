import File from '../models/File.js';
import Project from '../models/Project.js';

// Socket.io instance (will be injected)
let io = null;

// Function to set socket.io instance
export const setSocketIO = (socketIO) => {
  console.log("🔍 [DEBUG] setSocketIO called with:", socketIO ? "Socket instance" : "null");
  io = socketIO;
  console.log("🔍 [DEBUG] io variable set to:", io ? "Socket instance" : "null");
};

// Create a new file
export const createFile = async (req, res) => {
  try {
    console.log("🔍 [DEBUG] createFile called with:", req.body);
    console.log("🔍 [DEBUG] Current io instance:", io ? "EXISTS" : "NULL");
    const { name, content, path, language, projectId } = req.body;
    const userId = req.user._id;
    console.log("🔍 [DEBUG] Extracted data:", { name, content, path, language, projectId, userId });

    // Verify project exists and user has access
    console.log("🔍 [DEBUG] Looking for project:", projectId);
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: userId },
        { 'collaborators.user': userId }
      ]
    });
    console.log("🔍 [DEBUG] Project found:", project ? "YES" : "NO");

    if (!project) {
      console.log("❌ [DEBUG] Project not found or access denied");
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    // Check if file already exists at this path
    console.log("🔍 [DEBUG] Checking for existing file at path:", path);
    const existingFile = await File.findOne({
      project: projectId,
      path: path
    });
    console.log("🔍 [DEBUG] Existing file found:", existingFile ? "YES" : "NO");

    if (existingFile) {
      console.log("❌ [DEBUG] File already exists at this path");
      return res.status(400).json({ message: 'File already exists at this path' });
    }

    // Create new file
    console.log("🔍 [DEBUG] Creating new file object");
    const file = new File({
      name,
      content: content || '',
      path,
      project: projectId,
      language: language || 'javascript',
      createdBy: userId,
      lastModifiedBy: userId,
      size: content ? content.length : 0
    });
    console.log("🔍 [DEBUG] File object created:", file);

    console.log("🔍 [DEBUG] Saving file to database");
    await file.save();
    console.log("🔍 [DEBUG] File saved successfully with ID:", file._id);

    // Add file to project
    console.log("🔍 [DEBUG] Adding file to project");
    await Project.findByIdAndUpdate(projectId, {
      $push: { files: file._id },
      lastActivity: new Date()
    });
    console.log("🔍 [DEBUG] File added to project successfully");

    // Emit real-time file creation event
    console.log("🔍 [DEBUG] Checking if io instance exists:", io ? "YES" : "NO");
    if (io) {
      const roomName = `project-${projectId}`;
      console.log("🔍 [DEBUG] Emitting to room:", roomName);
      
      // Check how many users are in the room
      const room = io.sockets.adapter.rooms.get(roomName);
      const roomSize = room ? room.size : 0;
      console.log("🔍 [DEBUG] Users in room:", roomSize);
      
      const eventData = {
        file: {
          _id: file._id,
          name: file.name,
          path: file.path,
          language: file.language,
          content: file.content,
          size: file.size,
          createdBy: file.createdBy,
          createdAt: file.createdAt
        },
        projectId,
        createdBy: userId
      };
      console.log("🔍 [DEBUG] Event data:", eventData);
      
      io.to(roomName).emit('file:created', eventData);
      console.log(`📁 [DEBUG] File created event emitted to ${roomSize} users: ${file.name} in project ${projectId} by user ${userId}`);
    } else {
      console.log("❌ [DEBUG] No io instance available - cannot emit file:created event");
    }

    console.log("🔍 [DEBUG] Sending success response");
    res.status(201).json({
      message: 'File created successfully',
      file
    });
  } catch (error) {
    console.error('❌ [DEBUG] Create file error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all files in a project
export const getProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    // Verify project access
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: userId },
        { 'collaborators.user': userId },
        { 'settings.isPublic': true }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    // Get files with tree structure
    const files = await File.find({
      project: projectId,
      isActive: true
    }).sort({ path: 1 });

    // Build file tree
    const fileTree = buildFileTree(files);

    res.json({ files: fileTree });
  } catch (error) {
    console.error('Get project files error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a specific file
export const getFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user._id;

    const file = await File.findById(fileId).populate('project');

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check project access
    const project = await Project.findOne({
      _id: file.project._id,
      $or: [
        { owner: userId },
        { 'collaborators.user': userId },
        { 'settings.isPublic': true }
      ]
    });

    if (!project) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ file });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update file content
export const updateFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { content, name, language } = req.body;
    const userId = req.user._id;

    const file = await File.findById(fileId).populate('project');

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check project access
    const project = await Project.findOne({
      _id: file.project._id,
      $or: [
        { owner: userId },
        { 'collaborators.user': userId }
      ]
    });

    if (!project) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update file
    const updateData = {
      lastModifiedBy: userId,
      lastActivity: new Date()
    };

    if (content !== undefined) {
      updateData.content = content;
      updateData.size = content.length;
      updateData.version = file.version + 1;
    }

    if (name) updateData.name = name;
    if (language) updateData.language = language;

    const updatedFile = await File.findByIdAndUpdate(
      fileId,
      updateData,
      { new: true, runValidators: true }
    );

    // Update project last activity
    await Project.findByIdAndUpdate(file.project._id, {
      lastActivity: new Date()
    });

    res.json({
      message: 'File updated successfully',
      file: updatedFile
    });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a file
export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user._id;

    const file = await File.findById(fileId).populate('project');

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check project access
    const project = await Project.findOne({
      _id: file.project._id,
      $or: [
        { owner: userId },
        { 'collaborators.user': userId }
      ]
    });

    if (!project) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Soft delete (mark as inactive)
    await File.findByIdAndUpdate(fileId, {
      isActive: false,
      lastModifiedBy: userId
    });

    // Remove file from project
    await Project.findByIdAndUpdate(file.project._id, {
      $pull: { files: fileId },
      lastActivity: new Date()
    });

    // Emit real-time file deletion event
    if (io) {
      const roomName = `project-${file.project._id}`;
      io.to(roomName).emit('file:deleted', {
        fileId,
        projectId: file.project._id,
        deletedBy: userId
      });
      console.log(`🗑️ File deleted: ${file.name} in project ${file.project._id} by user ${userId}`);
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a directory
export const createDirectory = async (req, res) => {
  try {
    const { name, path, projectId } = req.body;
    const userId = req.user._id;

    // Verify project access
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: userId },
        { 'collaborators.user': userId }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    // Check if directory already exists
    const existingDir = await File.findOne({
      project: projectId,
      path: path,
      isDirectory: true
    });

    if (existingDir) {
      return res.status(400).json({ message: 'Directory already exists at this path' });
    }

    // Create directory
    const directory = new File({
      name,
      path,
      project: projectId,
      isDirectory: true,
      createdBy: userId,
      lastModifiedBy: userId,
      mimeType: 'inode/directory'
    });

    await directory.save();

    // Add to project
    await Project.findByIdAndUpdate(projectId, {
      $push: { files: directory._id },
      lastActivity: new Date()
    });

    res.status(201).json({
      message: 'Directory created successfully',
      directory
    });
  } catch (error) {
    console.error('Create directory error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper function to build file tree
const buildFileTree = (files) => {
  const tree = [];
  const fileMap = new Map();

  // Create a map of files by path
  files.forEach(file => {
    fileMap.set(file._id.toString(), { ...file.toObject(), children: [] });
  });

  // Build tree structure
  files.forEach(file => {
    const fileObj = fileMap.get(file._id.toString());
    
    if (file.parentDirectory) {
      const parent = fileMap.get(file.parentDirectory.toString());
      if (parent) {
        parent.children.push(fileObj);
      }
    } else {
      tree.push(fileObj);
    }
  });

  return tree;
};