import express from 'express';
import { getTrips, createTrip, getTripStats, updateTrip, deleteTrip } from '../controllers/tripController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
// Rutas espedificas para obtener estadísticas de viajes
router.get('/stats', protect, getTripStats);

// Rutas genericas 
router.route('/')
  .get(protect, getTrips)
  .post(protect, createTrip);

// Rutas con id de viaje
router.route('/:id')
  .put(protect, updateTrip)
  .delete(protect, deleteTrip);

export default router;