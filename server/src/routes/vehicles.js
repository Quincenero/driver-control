// server/src/routes/vehicles.js
import express from 'express';
import Vehicle from '../models/Vehicle.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/active', protect, async (req, res) => {
  const vehicle = await Vehicle.findOne({
    owner: req.user._id,
    isActive: true,
    status: 'activo',
  }).sort({ createdAt: -1 });
  res.json({ vehicle: vehicle ?? null });
});

router.get('/', protect, async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user._id, isActive: true })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ vehicles });
});

router.get('/:id', protect, async (req, res) => {
  const vehicle = await Vehicle.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });
  if (!vehicle) return res.status(404).json({ message: 'Vehículo no encontrado' });
  res.json({ vehicle });
});

router.post('/', protect, async (req, res) => {
  try {
    const vehicle = await Vehicle.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ vehicle });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'La patente ya está registrada' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Error al crear el vehículo' });
  }
});

router.patch('/:id', protect, async (req, res) => {
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!vehicle) return res.status(404).json({ message: 'Vehículo no encontrado' });
  res.json({ vehicle });
});

router.delete('/:id', protect, async (req, res) => {
  const vehicle = await Vehicle.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { $set: { isActive: false, status: 'baja' } },
    { new: true }
  );
  if (!vehicle) return res.status(404).json({ message: 'Vehículo no encontrado' });
  res.json({ vehicle });
});

export default router;