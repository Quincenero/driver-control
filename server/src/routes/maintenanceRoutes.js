// routes/maintenance.js
import express from 'express';
import {
  getMaintenances,
  createMaintenance,
  getMaintenanceSummary,
  updateMaintenance,
  deleteMaintenance,
} from '../controllers/maintenanceController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Ruta específica primero
router.get('/summary', protect, getMaintenanceSummary);

// Rutas genéricas
router.route('/')
  .get(protect, getMaintenances)
  .post(protect, createMaintenance);

router.route('/:id')
  .put(protect, updateMaintenance)
  .delete(protect, deleteMaintenance);

export default router;