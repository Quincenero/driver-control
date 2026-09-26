// utils/validators.js
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  // Validar campos obligatorios
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son obligatorios',
    });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Formato de email inválido',
    });
  }

  // Validar longitud de contraseña
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener al menos 6 caracteres',
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email y contraseña son obligatorios',
    });
  }

  next();
};
