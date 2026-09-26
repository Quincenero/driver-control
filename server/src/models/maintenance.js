// models/Maintenance.js
import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tipo: {
      type: String,
      enum: {
        values: [
          'Aceite',
          'Frenos',
          'Neumáticos',
          'Filtros',
          'Batería',
          'Service',
          'Otro',
        ],
        message: '{VALUE} no es un tipo de mantenimiento válido',
      },
      required: [true, 'El tipo es obligatorio'],
      trim: true,
    },
    costo: {
      type: Number,
      required: [true, 'El costo es obligatorio'],
      min: [0.01, 'El costo debe ser mayor a 0'],
      validate: {
        validator: Number.isFinite,
        message: 'Costo inválido',
      },
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [200, 'La descripción no puede superar los 200 caracteres'],
    },
    fecha: {
      type: Date,
      default: Date.now,
      required: true,
    },
    kilometraje: {
      type: Number,
      min: [0, 'El kilometraje no puede ser negativo'],
    },
    vehiculo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      // opcional, igual que Fuel
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_, ret) => {
        delete ret._v;
        return ret;
      },
    },
  }
);

maintenanceSchema.index({ user: 1, fecha: -1 });

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
export default Maintenance;