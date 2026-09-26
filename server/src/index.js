import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import fuelRoutes from './routes/fuelRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import vehiclesRouter from './routes/vehicles.js';
import documentsRouter from './routes/documents.js';

dotenv.config();

const app = express();

// Seguridad básica
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Rate limiting para rutas sensibles de auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 intentos
  message: { success: false, message: 'Demasiados intentos, inténtalo más tarde' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Rutas base
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚕 DriverControl API funcionando',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    api: 'ok',
    database: req.app.locals.dbReady ? 'connected' : 'disconnected',
  });
});

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/documents', documentsRouter);

// Rutas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 4000;

const startServer = async () => {
  try {
    await connectDB();
    app.locals.dbReady = true;

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ El servidor no se inició porque MongoDB no está disponible.');
    process.exit(1);
  }
};

startServer();
