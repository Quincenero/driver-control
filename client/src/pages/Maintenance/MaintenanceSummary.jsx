// pages/Maintenance/MaintenanceSummary.jsx
import { useMaintenanceSummary } from '../../hooks/useMaintenances';

const formatCurrency = (v) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(Number(v) || 0);

export default function MaintenanceSummary() {
  const { summary, loading, error } = useMaintenanceSummary('mes');

  if (loading) return <p>Cargando…</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Resumen de Mantenimiento</h2>
      {summary.length === 0 ? (
        <p>Sin datos.</p>
      ) : (
        <ul>
          {summary.map((item) => (
            <li key={item.name}>
              {item.name}: {formatCurrency(item.value)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}