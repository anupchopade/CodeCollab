import express from 'express';
import {
  createFile,
  getProjectFiles,
  getFile,
  updateFile,
  deleteFile,
  createDirectory
} from '../controllers/fileController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// File CRUD routes
router.post('/', createFile);
router.get('/project/:projectId', getProjectFiles);
router.get('/:fileId', getFile);
router.put('/:fileId', updateFile);
router.delete('/:fileId', deleteFile);

// Directory routes
router.post('/directory', createDirectory);

export default router;