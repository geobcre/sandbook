import express from 'express';
import { 
  createCategory, 
  getCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory 
} from '../controllers/category.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Rutas pÃºblicas
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Rutas protegidas (solo admin)
router.post('/', authenticateToken, createCategory);
router.put('/:id', authenticateToken, updateCategory);
router.delete('/:id', authenticateToken, deleteCategory);

export default router; 
