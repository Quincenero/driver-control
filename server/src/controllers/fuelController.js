// controllers/fuelController.js
import Fuel from '../models/Fuel.js';
import Vehicle from '../models/Vehicle.js';
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

// Devuelve true si el vehículo existe y pertenece al usuario.
// Si viene null/undefined, se considera válido (opcional).
const isValidVehicle = async (vehiculoId, userId) => {
  if (!vehiculoId) return true;
  const exists = await Vehicle.exists({ _id: vehiculoId, owner: userId });
  return Boolean(exists);
};

// GET /api/fuel?periodo=hoy|semana|mes|año
export const getFuels = async (req, res, next) => {
  try {
    const { periodo = 'hoy', tipo, fecha } = req.query;

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
      filtro.fecha = { $gte: desde, $lte: hasta };
    } else {
      filtro.fecha = getDateRange(periodo);
    }

    if (tipo) filtro.tipo = tipo;

    const fuels = await Fuel.find(filtro)
      .populate('vehiculo', 'brand model plate')
      .sort({ fecha: -1 })
      .limit(200)
      .lean();

    res.json({ success: true, count: fuels.length, fuels });
  } catch (error) {
    next(error);
  }
};

// POST /api/fuel
export const createFuel = async (req, res, next) => {
  try {
    const { tipo, total, lugarCarga, fecha, vehiculo } = req.body;

    const totalNum = Number(total);
    if (!Number.isFinite(totalNum) || totalNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total inválido: debe ser un número mayor a 0',
      });
    }
    if (!lugarCarga || !String(lugarCarga).trim()) {
      return res.status(400).json({
        success: false,
        message: 'El lugar de carga es obligatorio',
      });
    }

    const ok = await isValidVehicle(vehiculo, req.user._id);
    if (!ok) {
      return res.status(400).json({
        success: false,
        message: 'Vehículo inválido',
      });
    }

    const fuel = await Fuel.create({
      user: req.user._id,
      tipo,
      total: totalNum,
      lugarCarga: String(lugarCarga).trim(),
      fecha: parseFechaLocal(fecha),
      vehiculo: vehiculo || null,
    });

    res.status(201).json({ success: true, fuel });
  } catch (error) {
    next(error);
  }
};

// GET /api/fuel/summary?periodo=hoy|semana|mes|año
export const getFuelSummary = async (req, res, next) => {
  try {
    const { periodo = 'hoy' } = req.query;

    if (!PERIODOS_VALIDOS.includes(periodo)) {
      return res.status(400).json({
        success: false,
        message: `Periodo inválido. Válidos: ${PERIODOS_VALIDOS.join(', ')}`,
      });
    }

    const summary = await Fuel.aggregate([
      {
        $match: {
          user: req.user._id,
          fecha: getDateRange(periodo),
        },
      },
      {
        $group: {
          _id: '$tipo',
          value: { $sum: '$total' },
        },
      },
      { $project: { _id: 0, name: '$_id', value: 1 } },
      { $sort: { value: -1 } },
    ]);

    res.json({ success: true, summary });
  } catch (error) {
    next(error);
  }
};

// PUT /api/fuel/:id
export const updateFuel = async (req, res, next) => {
  try {
    const fuel = await Fuel.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!fuel) {
      return res.status(404).json({
        success: false,
        message: 'Registro no encontrado',
      });
    }

    const { tipo, total, lugarCarga, fecha, vehiculo } = req.body;

    if (tipo !== undefined) fuel.tipo = tipo;
    if (lugarCarga !== undefined) fuel.lugarCarga = String(lugarCarga).trim();
    if (fecha !== undefined) fuel.fecha = parseFechaLocal(fecha);

    if (total !== undefined) {
      const totalNum = Number(total);
      if (!Number.isFinite(totalNum) || totalNum <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Total inválido',
        });
      }
      fuel.total = totalNum;
    }

    if (vehiculo !== undefined) {
      const ok = await isValidVehicle(vehiculo, req.user._id);
      if (!ok) {
        return res.status(400).json({
          success: false,
          message: 'Vehículo inválido',
        });
      }
      fuel.vehiculo = vehiculo || null;
    }

    await fuel.save();

    res.json({ success: true, fuel });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/fuel/:id
export const deleteFuel = async (req, res, next) => {
  try {
    const fuel = await Fuel.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!fuel) {
      return res.status(404).json({
        success: false,
        message: 'Registro no encontrado',
      });
    }
    res.json({ success: true, message: 'Registro eliminado' });
  } catch (error) {
    next(error);
  }
};