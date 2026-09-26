import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado: token no proporcionado',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Si tu modelo tiene un campo "activo", puedes validar aquí:
    if (user.activo === false) {
      return res.status(401).json({
        success: false,
        message: 'Usuario desactivado',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    const msg =
      error.name === 'TokenExpiredError'
        ? 'Token expirado'
        : 'Token inválido';
    return res.status(401).json({ success: false, message: msg });
  }
};
