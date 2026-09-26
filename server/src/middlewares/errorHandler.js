// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error capturado:", err);

  // Error de validación de Mongoose
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: "Error de validación",
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
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Formato inválido para el campo '${err.path}'`,
    });
  }

  // Otros errores (fallback)
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
  });
};
