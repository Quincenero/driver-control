// utils/dateRange.js
export function getDateRange(periodo, now = new Date()) {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  
  switch (periodo) {
    case 'hoy':
      break;
    case 'semana': {
      const day = start.getDay(); // 0 dom ... 6 sab
      const diff = (day === 0 ? 6 : day - 1); // lunes como inicio
      start.setDate(start.getDate() - diff);
      break;
    }
    case 'mes':
      start.setDate(1);
      break;
    case 'año':
    case 'ano':
      start.setMonth(0, 1);
      break;
    default:
      // default: hoy
      break;
  }
  return { $gte: start, $lte: end };
}