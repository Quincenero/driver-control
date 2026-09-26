// server/src/models/Vehicle.js
import mongoose from 'mongoose';
import User from './User.js';

export const FUEL_TYPES = ['nafta', 'diesel', 'gnc', 'hibrido', 'electrico'];
export const VEHICLE_STATUS = ['activo', 'inactivo', 'mantenimiento', 'baja'];

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    brand: {
      type: String,
      required: [true, 'La marca es obligatoria'],
      trim: true,
      maxlength: 50,
    },
    model: {
      type: String,
      required: [true, 'El modelo es obligatorio'],
      trim: true,
      maxlength: 80,
    },
    year: {
        type: Number,
        required: true,
        min: [2006, 'El año no puede ser anterior a 2006'],
        validate: {
          validator: function (v) {
            return v <= new Date().getFullYear() + 1;
          },
          message: (props) =>
            `El año ${props.value} supera el máximo permitido (${new Date().getFullYear() + 1})`,
        },
      },
    plate: {
      type: String,
      required: [true, 'La patente es obligatoria'],
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
      match: [/^[A-Z0-9]{5,8}$/, 'Formato de patente inválido'],
    },
    color: { type: String, trim: true, default: '' },
    fuelType: { type: String, enum: FUEL_TYPES, default: 'nafta' },
    status: { type: String, enum: VEHICLE_STATUS, default: 'activo', index: true },
    odometer: { type: Number, min: 0, default: 0 },
    lastServiceDate: { type: Date, default: null },
    lastServiceKm: { type: Number, min: 0, default: null },
    nextServiceKm: { type: Number, min: 0, default: null },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

vehicleSchema.index({ owner: 1, status: 1 });

vehicleSchema.virtual('displayName').get(function () {
  return `${this.brand} ${this.model} (${this.plate})`;
});

vehicleSchema.virtual('needsService').get(function () {
  if (!this.nextServiceKm) return false;
  return this.odometer >= this.nextServiceKm;
});

vehicleSchema.pre('validate', function (next) {
  if (
    this.nextServiceKm != null &&
    this.lastServiceKm != null &&
    this.nextServiceKm < this.lastServiceKm
  ) {
    return next(
      new Error('nextServiceKm no puede ser menor que lastServiceKm')
    );
  }
  next();
});

vehicleSchema.post('save', async function (doc) {
  // Solo si este vehículo es el principal del owner
  if (doc.status === 'activo' && doc.isActive) {
    await User.updateOne(
      { _id: doc.owner },
      {
        $set: {
          vehicleModel: `${doc.brand} ${doc.model}`.trim(),
          vehiclePlate: doc.plate,
        },
      }
    );
  }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;