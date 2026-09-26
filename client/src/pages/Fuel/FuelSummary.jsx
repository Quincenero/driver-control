// pages/Fuel/FuelSummary.jsx
import { useFuelSummary } from '../../hooks/useFuels';

const formatCurrency = (v) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(Number(v) || 0);

export default function FuelSummary() {
  const { summary, loading, error } = useFuelSummary('hoy');

  if (loading) return <p>Cargando…</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Resumen de Combustible</h2>
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