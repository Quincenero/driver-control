// pages/Expenses/ExpenseFilters.jsx
import { Search, X } from 'lucide-react';
import styles from './ExpenseFilters.module.css';

const PERIODOS = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mes' },
  { value: 'año', label: 'Este año' },
];

const CATEGORIAS = ['', 'Peaje', 'Lavado', 'Otro'];

export default function ExpenseFilters({ filtros, onChange, onClear }) {
  const esFechaPersonalizada = Boolean(filtros.fecha);

  const handlePeriodo = (periodo) => {
    onChange({ ...filtros, periodo, fecha: undefined });
  };

  const handleFecha = (fecha) => {
    onChange({ ...filtros, fecha: fecha || undefined });
  };

  const handleCategory = (category) => {
    onChange({ ...filtros, category: category || undefined });
  };

  const hayFiltrosActivos =
    Boolean(filtros.category) ||
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
          <label className={styles.dateLabel} htmlFor="expense-filtro-fecha">
            <Search size={14} />
            Fecha exacta
          </label>
          <input
            id="expense-filtro-fecha"
            type="date"
            className={styles.dateInput}
            value={filtros.fecha || ''}
            onChange={(e) => handleFecha(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.categories}>
          {CATEGORIAS.map((c) => (
            <button
              key={c || 'todas'}
              type="button"
              className={`${styles.chip} ${
                (filtros.category || '') === c ? styles.active : ''
              }`}
              onClick={() => handleCategory(c)}
            >
              {c || 'Todas'}
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