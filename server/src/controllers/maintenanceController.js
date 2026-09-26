// controllers/maintenanceController.js
import Maintenance from '../models/maintenance.js';
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

// Validación reutilizable de vehículo
const isValidVehicle = async (vehiculoId, userId) => {
  if (!vehiculoId) return true;
  const exists = await Vehicle.exists({ _id: vehiculoId, owner: userId });
  return Boolean(exists);
};

// GET /api/maintenance?periodo=hoy&tipo=Aceite&fecha=2026-09-18
export const getMaintenances = async (req, res, next) => {
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

    const maintenances = await Maintenance.find(filtro)
      .populate('vehiculo', 'brand model plate')
      .sort({ fecha: -1 })
      .limit(200)
      .lean();

    res.json({ success: true, count: maintenances.length, maintenances });
  } catch (error) {
    next(error);
  }
};

// POST /api/maintenance
export const createMaintenance = async (req, res, next) => {
  try {
    const { tipo, costo, descripcion, fecha, kilometraje, vehiculo } = req.body;

    const costoNum = Number(costo);
    if (!Number.isFinite(costoNum) || costoNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Costo inválido: debe ser un número mayor a 0',
      });
    }

    const kmNum =
      kilometraje !== undefined && kilometraje !== ''
        ? Number(kilometraje)
        : undefined;
    if (kmNum !== undefined && (!Number.isFinite(kmNum) || kmNum < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Kilometraje inválido',
      });
    }

    const ok = await isValidVehicle(vehiculo, req.user._id);
    if (!ok) {
      return res.status(400).json({
        success: false,
        message: 'Vehículo inválido',
      });
    }

    const maintenance = await Maintenance.create({
      user: req.user._id,
      tipo,
      costo: costoNum,
      descripcion: descripcion?.trim() || '',
      fecha: parseFechaLocal(fecha),
      kilometraje: kmNum,
      vehiculo: vehiculo || null,
    });

    res.status(201).json({ success: true, maintenance });
  } catch (error) {
    next(error);
  }
};

// GET /api/maintenance/summary?periodo=hoy
export const getMaintenanceSummary = async (req, res, next) => {
  try {
    const { periodo = 'hoy' } = req.query;

    if (!PERIODOS_VALIDOS.includes(periodo)) {
      return res.status(400).json({
        success: false,
        message: `Periodo inválido. Válidos: ${PERIODOS_VALIDOS.join(', ')}`,
      });
    }

    const summary = await Maintenance.aggregate([
      {
        $match: {
          user: req.user._id,
          fecha: getDateRange(periodo),
        },
      },
      {
        $group: {
          _id: '$tipo',
          value: { $sum: '$costo' },
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

// PUT /api/maintenance/:id
export const updateMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Registro no encontrado',
      });
    }

    const { tipo, costo, descripcion, fecha, kilometraje, vehiculo } = req.body;

    if (tipo !== undefined) maintenance.tipo = tipo;

    if (descripcion !== undefined) {
      maintenance.descripcion = String(descripcion).trim();
    }

    if (fecha !== undefined) {
      maintenance.fecha = parseFechaLocal(fecha);
    }

    if (kilometraje !== undefined) {
      const kmNum = kilometraje === '' ? undefined : Number(kilometraje);
      if (kmNum !== undefined && (!Number.isFinite(kmNum) || kmNum < 0)) {
        return res.status(400).json({
          success: false,
          message: 'Kilometraje inválido',
        });
      }
      maintenance.kilometraje = kmNum;
    }

    // ✅ Vehículo FUERA del bloque de kilometraje
    if (vehiculo !== undefined) {
      const ok = await isValidVehicle(vehiculo, req.user._id);
      if (!ok) {
        return res.status(400).json({
          success: false,
          message: 'Vehículo inválido',
        });
      }
      maintenance.vehiculo = vehiculo || null;
    }

    if (costo !== undefined) {
      const costoNum = Number(costo);
      if (!Number.isFinite(costoNum) || costoNum <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Costo inválido',
        });
      }
      maintenance.costo = costoNum;
    }

    await maintenance.save();

    res.json({ success: true, maintenance });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/maintenance/:id
export const deleteMaintenance = async (req, res, next) => {
  try {
    const maintenance = await Maintenance.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!maintenance) {
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