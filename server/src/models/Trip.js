// models/Trip.js
import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plataforma: {
      type: String,
      enum: ['Uber', 'Didi', 'Taxi', 'Cabify'],
      required: [true, 'La plataforma es obligatoria'],
      default: 'Taxi',
      trim: true,
    },
    tipoPago: {
      type: String,
      enum: [
        'efectivo',
        'tarjeta de crédito',
        'tarjeta de débito',
        'transferencia',
        'App de pago',
      ],
      required: [true, 'El tipo de pago es obligatorio'],
      trim: true,
    },
    monto: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      min: [0.01, 'El monto debe ser mayor a 0'],
      validate: {
        validator: Number.isFinite,
        message: 'Monto inválido',
      },
    },
    fecha: {
      type: Date,
      default: Date.now,
      required: true,
    },
    // 'hora' se eliminó: ya está incluida en 'fecha' (Date).
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_, ret) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

// Índice compuesto: consultas por usuario ordenadas por fecha
tripSchema.index({ user: 1, fecha: -1 });

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;