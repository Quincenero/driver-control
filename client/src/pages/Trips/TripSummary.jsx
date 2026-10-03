// pages/Trips/TripSummary.jsx
import { useMemo } from 'react';
import { DollarSign, Car, TrendingUp } from 'lucide-react';
import styles from './TripSummary.module.css';

const currencyFmt = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
});

const formatCurrency = (v) => currencyFmt.format(Number(v) || 0);

const PERIODO_LABELS = {
  hoy: 'Hoy',
  semana: 'Esta semana',
  mes: 'Este mes',
  año: 'Este año',
};

const formatFechaLarga = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export default function TripSummary({ trips, filtros }) {
  const stats = useMemo(() => {
    const list = Array.isArray(trips) ? trips : [];
    const total = list.reduce((s, t) => s + (Number(t?.monto) || 0), 0);
    const count = list.length;
    const average = count > 0 ? total / count : 0;

    // Desglose por plataforma
    const porPlataforma = {};
    for (const t of list) {
      const p = t?.plataforma || 'Sin especificar';
      if (!porPlataforma[p]) porPlataforma[p] = { count: 0, total: 0 };
      porPlataforma[p].count += 1;
      porPlataforma[p].total += Number(t?.monto) || 0;
    }

    // Ordenar por total descendente
    const breakdown = Object.entries(porPlataforma)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);

    return { total, count, average, breakdown };
  }, [trips]);

  // Descripción del filtro activo
  const descripcion = useMemo(() => {
    if (filtros?.fecha) return formatFechaLarga(filtros.fecha);
    return PERIODO_LABELS[filtros?.periodo] ?? 'Hoy';
  }, [filtros]);

  const plataformaActiva = filtros?.plataforma;
  const mostrarBreakdown = !plataformaActiva && stats.breakdown.length > 1;

  return (
    <section className={styles.summary} aria-label="Resumen del período">
      <header className={styles.header}>
        <span className={styles.period}>{descripcion}</span>
        {plataformaActiva && (
          <span className={styles.platformBadge}>{plataformaActiva}</span>
        )}
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.income}`}>
            <DollarSign size={18} aria-hidden="true" />
          </div>
          <div className={styles.statBody}>
            <span className={styles.statLabel}>Recaudación</span>
            <span className={`${styles.statValue} ${styles.incomeValue}`}>
              {formatCurrency(stats.total)}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.trips}`}>
            <Car size={18} aria-hidden="true" />
          </div>
          <div className={styles.statBody}>
            <span className={styles.statLabel}>Viajes</span>
            <span className={styles.statValue}>{stats.count}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.average}`}>
            <TrendingUp size={18} aria-hidden="true" />
          </div>
          <div className={styles.statBody}>
            <span className={styles.statLabel}>Promedio</span>
            <span className={styles.statValue}>
              {formatCurrency(stats.average)}
            </span>
          </div>
        </div>
      </div>

      {mostrarBreakdown && (
        <div className={styles.breakdown}>
          <span className={styles.breakdownTitle}>Por plataforma</span>
          <ul className={styles.breakdownList}>
            {stats.breakdown.map((p) => {
              const pct = stats.total > 0 ? (p.total / stats.total) * 100 : 0;
              return (
                <li key={p.name} className={styles.breakdownItem}>
                  <div className={styles.breakdownRow}>
                    <span className={styles.breakdownName}>{p.name}</span>
                    <span className={styles.breakdownCount}>
                      {p.count} {p.count === 1 ? 'viaje' : 'viajes'}
                    </span>
                    <span className={styles.breakdownValue}>
                      {formatCurrency(p.total)}
                    </span>
                  </div>
                  <div className={styles.breakdownBar}>
                    <div
                      className={styles.breakdownFill}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}