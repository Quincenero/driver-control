// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';
  const isOperational = err.statusCode && err.statusCode < 500;

  // Log selectivo: solo logueamos stack completo si es un 500 real
  if (!isOperational) {
    console.error('❌ Error inesperado:', err);
  } else if (!isProd) {
    console.warn('⚠️ Error controlado:', err.message);
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: messages,
    });
  }

  // Error de duplicado (índice único)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `El valor para '${field}' ya está en uso`,
    });
  }

  // Error de conversión de ObjectId inválido (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Formato inválido para el campo '${err.path}'`,
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Sesión expirada',
    });
  }

  // Fallback
  const statusCode = err.statusCode || 500;
  const message =
    statusCode < 500
      ? err.message
      : isProd
        ? 'Error interno del servidor'
        : err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message,
  });
};