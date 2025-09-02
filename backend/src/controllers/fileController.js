import File from '../models/File.js';
import Project from '../models/Project.js';

// Create a new file
export const createFile = async (req, res) => {
  try {
    const { name, content, path, language, projectId } = req.body;
    const userId = req.user._id;

    // Verify project exists and user has access
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

    // Check if file already exists at this path
    const existingFile = await File.findOne({
      project: projectId,
      path: path
    });

    if (existingFile) {
      return res.status(400).json({ message: 'File already exists at this path' });
    }

    // Create new file
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

    await file.save();

    // Add file to project
    await Project.findByIdAndUpdate(projectId, {
      $push: { files: file._id },
      lastActivity: new Date()
    });

    res.status(201).json({
      message: 'File created successfully',
      file
    });
  } catch (error) {
    console.error('Create file error:', error);
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