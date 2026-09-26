// server/src/routes/documents.js
import express from 'express';
import Document, { DOCUMENT_TYPES } from '../models/Document.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Público: metadata de tipos (podría requerir auth si querés)
router.get('/types', (req, res) => {
  const types = Object.entries(DOCUMENT_TYPES).map(([key, meta]) => ({
    value: key,
    ...meta,
  }));
  res.json({ types });
});

router.get('/', protect, async (req, res) => {
  const docs = await Document.find({ owner: req.user._id, isActive: true })
    .populate('vehicle', 'brand model plate')
    .sort({ expiresAt: 1 });
  res.json({ documents: docs });
});

router.get('/alerts', protect, async (req, res) => {
  const docs = await Document.findNeedingAttention(req.user._id);
  res.json({ alerts: docs });
});

router.get('/history', protect, async (req, res) => {
  const { type, vehicle } = req.query;
  if (!type) return res.status(400).json({ message: 'type es requerido' });
  const docs = await Document.findHistory(req.user._id, type, vehicle || null);
  res.json({ history: docs });
});

router.post('/', protect, async (req, res) => {
  try {
    const doc = await Document.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ document: doc });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Error al crear el documento' });
  }
});

router.patch('/:id', protect, async (req, res) => {
  const doc = await Document.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!doc) return res.status(404).json({ message: 'Documento no encontrado' });
  res.json({ document: doc });
});

router.post('/:id/renew', protect, async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      owner: req.user._id,
      isActive: true,
    });
    if (!doc) return res.status(404).json({ message: 'Documento no encontrado' });

    const newDoc = await doc.renew(req.body || {});
    res.status(201).json({ document: newDoc });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Error al renovar el documento' });
  }
});

router.post('/:id/acknowledge', protect, async (req, res) => {
  const doc = await Document.findOne({
    _id: req.params.id,
    owner: req.user._id,
    isActive: true,
  });
  if (!doc) return res.status(404).json({ message: 'Documento no encontrado' });
  await doc.acknowledge();
  res.json({ document: doc });
});

router.delete('/:id', protect, async (req, res) => {
  const doc = await Document.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { $set: { isActive: false, archivedAt: new Date() } },
    { new: true }
  );
  if (!doc) return res.status(404).json({ message: 'Documento no encontrado' });
  res.json({ document: doc });
});

export default router;