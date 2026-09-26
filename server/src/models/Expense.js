// models/Expense.js
import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: {
        values: ['Peaje', 'Lavado', 'Otro'],
        message: '{VALUE} no es una categoría válida',
      },
      required: [true, 'La categoría es obligatoria'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      min: [0.01, 'El monto debe ser mayor a 0'],
      validate: {
        validator: Number.isFinite,
        message: 'Monto inválido',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'La descripción no puede superar los 200 caracteres'],
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
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

expenseSchema.index({ user: 1, date: -1 });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;