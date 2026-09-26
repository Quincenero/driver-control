// pages/Trips/TripFilters.jsx
import { Search, X } from 'lucide-react';
import styles from './TripFilters.module.css';

const PERIODOS = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mes' },
  { value: 'año', label: 'Este año' },
];

const PLATAFORMAS = ['', 'Uber', 'Cabify', 'Didi', 'Taxi'];

export default function TripFilters({
  filtros,
  onChange,
  onClear,
}) {
  const esFechaPersonalizada = Boolean(filtros.fecha);

  const handlePeriodo = (periodo) => {
    onChange({ ...filtros, periodo, fecha: undefined });
  };

  const handleFecha = (fecha) => {
    onChange({ ...filtros, fecha: fecha || undefined });
  };

  const handlePlataforma = (plataforma) => {
    onChange({ ...filtros, plataforma: plataforma || undefined });
  };

  const hayFiltrosActivos =
    Boolean(filtros.plataforma) ||
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
          <label className={styles.dateLabel} htmlFor="filtro-fecha">
            <Search size={14} />
            Fecha exacta
          </label>
          <input
            id="filtro-fecha"
            type="date"
            className={styles.dateInput}
            value={filtros.fecha || ''}
            onChange={(e) => handleFecha(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.platforms}>
          {PLATAFORMAS.map((p) => (
            <button
              key={p || 'todas'}
              type="button"
              className={`${styles.chip} ${
                (filtros.plataforma || '') === p ? styles.active : ''
              }`}
              onClick={() => handlePlataforma(p)}
            >
              {p || 'Todas'}
            </button>
          ))}
        </div>

        {hayFiltrosActivos && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={onClear}
          >
            <X size={14} />
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}