import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import crypto from 'crypto';

// -------------------------------------------
// Generar JWT
// -------------------------------------------
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// -------------------------------------------
// @desc    Registrar usuario
// @route   POST /api/auth/register
// -------------------------------------------
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone || '',
        birthDate: user.birthDate || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// @desc    Login
// @route   POST /api/auth/login
// -------------------------------------------
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son obligatorios' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone || '',
        birthDate: user.birthDate || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// @desc    Obtener perfil del usuario autenticado
// @route   GET /api/auth/me
// -------------------------------------------
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone || '',
        birthDate: user.birthDate || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// @desc    Actualizar perfil (campos adicionales)
// @route   PUT /api/auth/profile
// -------------------------------------------
export const updateProfile = async (req, res, next) => {
  try {
    const { lastName, phone, birthDate } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Actualizar solo los campos permitidos
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (birthDate !== undefined) user.birthDate = birthDate;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone || '',
        birthDate: user.birthDate || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------
// @desc    Olvidé contraseña - enviar email
// @route   POST /api/auth/forgot-password
// -------------------------------------------
export const forgotPassword = async (req, res, next) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'No existe usuario con ese email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${
      process.env.FRONTEND_URL || 'http://localhost:5173'
    }/reset-password/${resetToken}`;

    const message = `
      <h1>Restablecer contraseña</h1>
      <p>Haz clic en el siguiente enlace para cambiar tu contraseña (válido por 10 minutos):</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>Si no solicitaste esto, ignora este correo.</p>
    `;

    const { error } = await resend.emails.send({
      from: 'DriverControl <onboarding@resend.dev>',
      to: [user.email],
      subject: 'Restablecer contraseña',
      html: message,
      text: `Restablecé tu contraseña en: ${resetUrl}`,
    });

    if (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('[forgotPassword] Resend error:', error);
      return res.status(500).json({
        success: false,
        message: 'No se pudo enviar el correo. Intentá de nuevo más tarde.',
      });
    }

    res.status(200).json({
      success: true,
      message: `Correo enviado a ${user.email}`,
    });
  } catch (error) {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
      }
    } catch (cleanupError) {
      console.error('[forgotPassword] cleanup error:', cleanupError);
    }
    next(error);
  }
};
// -------------------------------------------
// @desc    Resetear contraseña
// @route   PUT /api/auth/reset-password/:token
// -------------------------------------------
export const resetPassword = async (req, res, next) => {
  try {
    const resetToken = req.params.token;
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token inválido o expirado' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};