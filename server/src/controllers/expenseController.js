// controllers/expenseController.js
import Expense from '../models/Expense.js';
import { getDateRange, PERIODOS_VALIDOS } from '../utils/dateRange.js';

const parseFechaLocal = (fechaStr) => {
  if (!fechaStr || !/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
    return new Date();
  }
  const [y, m, d] = fechaStr.split('-').map(Number);
  const result = new Date(y, m - 1, d, 0, 0, 0, 0);
  const now = new Date();
  result.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0);
  return result;
};

// GET /api/expenses?periodo=hoy&category=Peaje&fecha=2026-09-18
export const getExpenses = async (req, res, next) => {
  try {
    const { periodo = 'hoy', category, fecha } = req.query;

    if (!PERIODOS_VALIDOS.includes(periodo)) {
      return res.status(400).json({
        success: false,
        message: `Periodo inválido. Válidos: ${PERIODOS_VALIDOS.join(', ')}`,
      });
    }

    const filtro = { user: req.user._id };

    if (fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      const [y, m, d] = fecha.split('-').map(Number);
      const desde = new Date(y, m - 1, d, 0, 0, 0, 0);
      const hasta = new Date(y, m - 1, d, 23, 59, 59, 999);
      filtro.date = { $gte: desde, $lte: hasta };
    } else {
      filtro.date = getDateRange(periodo);
    }

    if (category) filtro.category = category;

    const expenses = await Expense.find(filtro)
      .sort({ date: -1 })
      .limit(200)
      .lean();

    res.json({ success: true, count: expenses.length, expenses });
  } catch (error) {
    next(error);
  }
};

// POST /api/expenses
export const createExpense = async (req, res, next) => {
  try {
    const { category, amount, description, date } = req.body;

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Monto inválido: debe ser un número mayor a 0',
      });
    }

    const expense = await Expense.create({
      user: req.user._id,
      category,
      amount: amountNum,
      description: description?.trim() || '',
      date: parseFechaLocal(date),
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

// GET /api/expenses/summary?periodo=hoy
export const getExpenseSummary = async (req, res, next) => {
  try {
    const { periodo = 'hoy' } = req.query;

    if (!PERIODOS_VALIDOS.includes(periodo)) {
      return res.status(400).json({
        success: false,
        message: `Periodo inválido. Válidos: ${PERIODOS_VALIDOS.join(', ')}`,
      });
    }

    const summary = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: getDateRange(periodo),
        },
      },
      { $group: { _id: '$category', value: { $sum: '$amount' } } },
      { $project: { _id: 0, name: '$_id', value: 1 } },
      { $sort: { value: -1 } },
    ]);

    res.json({ success: true, summary });
  } catch (error) {
    next(error);
  }
};

// PUT /api/expenses/:id
export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado',
      });
    }

    const { category, amount, description, date } = req.body;

    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = String(description).trim();
    if (date !== undefined) expense.date = parseFechaLocal(date);
    if (amount !== undefined) {
      const amountNum = Number(amount);
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Monto inválido',
        });
      }
      expense.amount = amountNum;
    }

    await expense.save();
    res.json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/expenses/:id
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Gasto no encontrado',
      });
    }
    res.json({ success: true, message: 'Gasto eliminado' });
  } catch (error) {
    next(error);
  }
};