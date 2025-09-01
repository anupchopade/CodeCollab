import Project from '../models/Project.js';
import File from '../models/File.js';
import User from '../models/User.js'; 

// Create a new project
export const createProject = async (req, res) => {
  try {
    const { name, description, tags, settings } = req.body;
    const userId = req.user._id;

    // Check if project name already exists for this user
    const existingProject = await Project.findOne({
      owner: userId,
      name: name
    });

    if (existingProject) {
      return res.status(400).json({
        message: 'A project with this name already exists'
      });
    }

    // Create new project
    const project = new Project({
      name,
      description: description || '',
      owner: userId,
      tags: tags || [],
      settings: settings || {
        isPublic: false,
        allowForking: true,
        theme: 'auto',
        language: 'javascript'
      }
    });

    await project.save();

    // Add project to user's created projects
    await User.findByIdAndUpdate(userId, {
      $push: { createdProjects: project._id }
    });

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all projects for the current user
export const getUserProjects = async (req, res) => {
  try {
    const userId = req.user._id;

    const projects = await Project.find({
      $or: [
        { owner: userId },
        { 'collaborators.user': userId }
      ]
    })
    .populate('owner', 'username email profile.avatar')
    .populate('collaborators.user', 'username email profile.avatar')
    .sort({ updatedAt: -1 });

    res.json({ projects });
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a specific project by ID
export const getProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { owner: userId },
        { 'collaborators.user': userId },
        { 'settings.isPublic': true }
      ]
    })
    .populate('owner', 'username email profile.avatar')
    .populate('collaborators.user', 'username email profile.avatar')
    .populate('files');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update a project
export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, tags, settings } = req.body;
    const userId = req.user._id;

    // Find project and check ownership
    const project = await Project.findOne({
      _id: projectId,
      owner: userId
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        name: name || project.name,
        description: description !== undefined ? description : project.description,
        tags: tags || project.tags,
        settings: { ...project.settings, ...settings },
        lastActivity: new Date()
      },
      { new: true, runValidators: true }
    )
    .populate('owner', 'username email profile.avatar')
    .populate('collaborators.user', 'username email profile.avatar');

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a project
export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    // Find project and check ownership
    const project = await Project.findOne({
      _id: projectId,
      owner: userId
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    // Delete all files in the project
    await File.deleteMany({ project: projectId });

    // Delete the project
    await Project.findByIdAndDelete(projectId);

    // Remove project from user's created projects
    await User.findByIdAndUpdate(userId, {
      $pull: { createdProjects: projectId }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add collaborator to project
export const addCollaborator = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role = 'editor' } = req.body;
    const userId = req.user._id;

    // Find project and check ownership
    const project = await Project.findOne({
      _id: projectId,
      owner: userId
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    // Find user to add as collaborator
    const collaborator = await User.findOne({ email });
    if (!collaborator) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a collaborator
    const isAlreadyCollaborator = project.collaborators.some(
      c => c.user.toString() === collaborator._id.toString()
    );

    if (isAlreadyCollaborator) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    // Add collaborator
    project.collaborators.push({
      user: collaborator._id,
      role,
      joinedAt: new Date()
    });

    await project.save();

    // Add project to collaborator's joined projects
    await User.findByIdAndUpdate(collaborator._id, {
      $push: { joinedProjects: projectId }
    });

    res.json({
      message: 'Collaborator added successfully',
      project
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove collaborator from project
export const removeCollaborator = async (req, res) => {
  try {
    const { projectId, collaboratorId } = req.params;
    const userId = req.user._id;

    // Find project and check ownership
    const project = await Project.findOne({
      _id: projectId,
      owner: userId
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found or access denied' });
    }

    // Remove collaborator
    project.collaborators = project.collaborators.filter(
      c => c.user.toString() !== collaboratorId
    );

    await project.save();

    // Remove project from collaborator's joined projects
    await User.findByIdAndUpdate(collaboratorId, {
      $pull: { joinedProjects: projectId }
    });

    res.json({
      message: 'Collaborator removed successfully',
      project
    });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};