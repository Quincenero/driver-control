// pages/Fuel/FuelFilters.jsx
import { Search, X } from 'lucide-react';
import styles from './FuelFilters.module.css';

const PERIODOS = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mes' },
  { value: 'año', label: 'Este año' },
];

const TIPOS = ['', 'Nafta', 'Diesel', 'GNC', 'Eléctrico'];

export default function FuelFilters({ filtros, onChange, onClear }) {
  const esFechaPersonalizada = Boolean(filtros.fecha);

  const handlePeriodo = (periodo) => {
    onChange({ ...filtros, periodo, fecha: undefined });
  };

  const handleFecha = (fecha) => {
    onChange({ ...filtros, fecha: fecha || undefined });
  };

  const handleTipo = (tipo) => {
    onChange({ ...filtros, tipo: tipo || undefined });
  };

  const hayFiltrosActivos =
    Boolean(filtros.tipo) ||
    Boolean(filtros.fecha) ||
    filtros.periodo !== 'hoy';

  return (
    <div className={styles.filters}>
      <div className={styles.row}>
        <div className={styles.periods}>
          {PERIODOS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`${styles.chip} ${
                filtros.periodo === p.value && !esFechaPersonalizada ? styles.active : ''
              }`}
              onClick={() => handlePeriodo(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className={styles.customDate}>
          <label className={styles.dateLabel} htmlFor="fuel-filtro-fecha">
            <Search size={14} />
            Fecha exacta
          </label>
          <input
            id="fuel-filtro-fecha"
            type="date"
            className={styles.dateInput}
            value={filtros.fecha || ''}
            onChange={(e) => handleFecha(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.types}>
          {TIPOS.map((t) => (
            <button
              key={t || 'todos'}
              type="button"
              className={`${styles.chip} ${
                (filtros.tipo || '') === t ? styles.active : ''
              }`}
              onClick={() => handleTipo(t)}
            >
              {t || 'Todos'}
            </button>
          ))}
        </div>

        {hayFiltrosActivos && (
          <button type="button" className={styles.clearBtn} onClick={onClear}>
            <X size={14} />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}