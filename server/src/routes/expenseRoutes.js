import express from 'express';
import {
  getExpenses,
  createExpense,
  getExpenseSummary,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas específicas primero
router.get('/summary', protect, getExpenseSummary);

// Rutas genéricas
router.route('/')
  .get(protect, getExpenses)
  .post(protect, createExpense);

// Rutas con :id
router.route('/:id')
  .put(protect, updateExpense)
  .delete(protect, deleteExpense);

export default router;