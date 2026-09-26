import express from 'express';
import { getFuels, 
        createFuel,
        getFuelSummary,
        updateFuel,
        deleteFuel } from '../controllers/fuelController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getFuels)
  .post(protect, createFuel);

router.get('/summary', protect, getFuelSummary);

router.route('/:id')
  .put(protect, updateFuel)
  .delete(protect, deleteFuel);

export default router;
