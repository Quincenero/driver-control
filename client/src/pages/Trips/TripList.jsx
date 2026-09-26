// pages/Trips/TripList.jsx
import styles from './TripList.module.css';

const formatCurrency = (v) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(Number(v) || 0);

const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-AR');
};

export default function TripList({ trips, loading, error, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className={styles.state}>
        <p>Cargando viajes…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.state} role="alert">
        <p style={{ color: 'var(--accent-red, #f43f5e)' }}>{error}</p>
      </div>
    );
  }

  if (!trips || trips.length === 0) {
    return (
      <div className={styles.state}>
        <p>No hay viajes con esos filtros.</p>
      </div>
    );
  }

  const showActions = Boolean(onEdit || onDelete);

  return (
    <div className={styles.tableResponsive}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Plataforma</th>
            <th>Tipo de Pago</th>
            <th>Monto</th>
            {showActions && <th aria-label="Acciones"></th>}
          </tr>
        </thead>
        <tbody>
          {trips.map((trip) => {
            const id = trip?._id || trip?.id;
            return (
              <tr key={id}>
                <td>{formatDate(trip?.fecha)}</td>
                <td>
                  <span className={styles.platformTag}>
                    {trip?.plataforma || 'N/A'}
                  </span>
                </td>
                <td>{trip?.tipoPago || 'N/A'}</td>
                <td className={styles.amount}>
                  {formatCurrency(trip?.monto)}
                </td>
                {showActions && (
                  <td className={styles.actionsCell}>
                    {onEdit && (
                      <button
                        type="button"
                        className={styles.editBtn}
                        onClick={() => onEdit(trip)}
                        aria-label="Editar viaje"
                      >
                        ✎
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => onDelete(id)}
                        aria-label="Eliminar viaje"
                      >
                        ×
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}