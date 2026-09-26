import mongoose from 'mongoose';

const fuelSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  tipo: {
    type: String,
    enum: ['Nafta', 'Diesel', 'Eléctrico', 'GNC'],
    required: true,
    default: 'GNC',
  },
  total: {
    type: Number,
    required: true,
    min: [0.01, 'El total debe ser mayor a 0'],
  },
  lugarCarga: {
    type: String,
    required: true,
    trim: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
  vehiculo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (_, ret) => {
      delete ret._v;
      return ret;
    },
  },
});

// Índice para consultas rápidas por tipo y fecha
fuelSchema.index({ tipo: 1, fecha: -1 });

const Fuel = mongoose.model('Fuel', fuelSchema);
export default Fuel;
