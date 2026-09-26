// controllers/tripController.js
import Trip from '../models/Trip.js';
import { getDateRange, PERIODOS_VALIDOS } from '../utils/dateRange.js';

const parseFechaHora = (fecha, hora) => {
  // Sin fecha válida → ahora
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return new Date();
  }

  const [y, m, d] = fecha.split('-').map(Number);

  // Construcción en hora LOCAL (evita bug de UTC con 'YYYY-MM-DD')
  const result = new Date(y, m - 1, d, 0, 0, 0, 0);

  if (hora && /^\d{2}:\d{2}(:\d{2})?$/.test(hora)) {
    const [hh, mm, ss = 0] = hora.split(':').map(Number);
    result.setHours(hh, mm, ss, 0);
  } else {
    // Sin hora → usar la hora actual del servidor
    const now = new Date();
    result.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0);
  }

  return result;
};

// GET /api/trips?periodo=hoy|semana|mes|año
export const getTrips = async (req, res, next) => {
  try {
    const { periodo = 'hoy', plataforma, tipoPago, fecha } = req.query;

    if (!PERIODOS_VALIDOS.includes(periodo)) {
      return res.status(400).json({
        success: false,
        message: `Periodo inválido. Válidos: ${PERIODOS_VALIDOS.join(', ')}`,
      });
    }

    const filtro ={
      user: req.user._id,
    };

    if (fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      const [y, m, d] = fecha.split('-').map(Number);
      const desde = new Date(y, m - 1, d, 0, 0, 0, 0);
      const hasta = new Date(y, m - 1, d, 23, 59, 59, 999);
      filtro.fecha = { $gte: desde, $lte: hasta };
    } else {
      filtro.fecha = getDateRange(periodo);
    }

    if (plataforma) {
      filtro.plataforma = plataforma;
    }
    
    if (tipoPago) {
      filtro.tipoPago = tipoPago;
    }

    const trips = await Trip.find(filtro)
      .sort({ fecha: -1 })
      .limit(200)
      .lean();

    res.json({ success: true, count: trips.length, trips });
  } catch (error) {
    next(error);
  }
};

// POST /api/trips
export const createTrip = async (req, res, next) => {
  try {
    const { fecha, hora, plataforma, tipoPago, monto } = req.body;

    const montoNum = Number(monto);
    if (!Number.isFinite(montoNum) || montoNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Monto inválido: debe ser un número mayor a 0',
      });
    }

    const fechaHora = parseFechaHora(fecha, hora);

    const trip = await Trip.create({
      user: req.user._id,
      plataforma,
      tipoPago,
      monto: montoNum,
      fecha: fechaHora,
    });

    res.status(201).json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};

// GET /api/trips/stats?periodo=hoy|semana|mes|año
export const getTripStats = async (req, res, next) => {
  try {
    const { periodo = 'hoy' } = req.query;

    if (!PERIODOS_VALIDOS.includes(periodo)) {
      return res.status(400).json({
        success: false,
        message: `Periodo inválido. Válidos: ${PERIODOS_VALIDOS.join(', ')}`,
      });
    }

    console.log('[getTripStats]', {
      periodo,
      userId: req.user._id.toString(),
      range: getDateRange(periodo),
    });

    const matchQuery = {
      user: req.user._id,
      fecha: getDateRange(periodo),
    };

    const result = await Trip.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalIngresos: { $sum: '$monto' },
          totalViajes: { $sum: 1 },
        },
      },
    ]);

    const raw = result[0] ?? { totalIngresos: 0, totalViajes: 0 };
    const totalIngresos = raw.totalIngresos ?? 0;
    const totalViajes = raw.totalViajes ?? 0;
    const promedio = totalViajes > 0 ? totalIngresos / totalViajes : 0;

    res.json({
      success: true,
      stats: { totalIngresos, totalViajes, promedio },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Viaje no encontrado' });
    }
    res.json({ success: true, message: 'Viaje eliminado' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/trips/:id
export const updateTrip = async (req, res, next) => {
  try {
    const { fecha, hora, plataforma, tipoPago, monto } = req.body;

    const montoNum = Number(monto);
    if (!Number.isFinite(montoNum) || montoNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Monto inválido: debe ser un número mayor a 0',
      });
    }

    const trip = await Trip.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Viaje no encontrado',
      });
    }

    // Solo actualizamos si viene el campo (permite partial updates)
    if (fecha !== undefined || hora !== undefined) {
      trip.fecha = parseFechaHora(fecha, hora);
    }
    if (plataforma !== undefined) trip.plataforma = plataforma;
    if (tipoPago !== undefined) trip.tipoPago = tipoPago;
    trip.monto = montoNum;

    await trip.save();

    res.json({ success: true, trip });
  } catch (error) {
    next(error);
  }
};