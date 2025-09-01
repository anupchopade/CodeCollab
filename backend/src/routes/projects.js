import express from 'express';
import {
  createProject,
  getUserProjects,
  getProject,
  updateProject,
  deleteProject,
  addCollaborator,
  removeCollaborator
} from '../controllers/projectController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Project CRUD routes
router.post('/', createProject);
router.get('/', getUserProjects);
router.get('/:projectId', getProject);
router.put('/:projectId', updateProject);
router.delete('/:projectId', deleteProject);

// Collaboration routes
router.post('/:projectId/collaborators', addCollaborator);
router.delete('/:projectId/collaborators/:collaboratorId', removeCollaborator);

export default router;