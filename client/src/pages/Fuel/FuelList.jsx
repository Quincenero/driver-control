// pages/Fuel/FuelList.jsx
import api from '../../api/axiosConfig';
import styles from './FuelList.module.css';

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

export default function FuelList({ fuels = [], loading, error, onEdit, refetch }) {
  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      await api.delete(`/fuel/${id}`);
      refetch?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className={styles.state}>
        <p>Cargando…</p>
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

  if (fuels.length === 0) {
    return (
      <div className={styles.state}>
        <p>No hay cargas con esos filtros.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableResponsive}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Lugar</th>
            <th>Total</th>
            <th aria-label="Acciones"></th>
          </tr>
        </thead>
        <tbody>
          {fuels.map((fuel) => {
            const id = fuel._id || fuel.id;
            return (
              <tr key={id}>
                <td>{formatDate(fuel.fecha)}</td>
                <td>
                  <span className={styles.typeTag}>{fuel.tipo || '—'}</span>
                </td>
                <td>{fuel.lugarCarga || '—'}</td>
                <td className={styles.amount}>{formatCurrency(fuel.total)}</td>
                <td className={styles.actionsCell}>
                  {onEdit && (
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => onEdit(fuel)}
                      aria-label="Editar"
                    >
                      ✎
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(id)}
                    aria-label="Eliminar"
                  >
                    ×
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}