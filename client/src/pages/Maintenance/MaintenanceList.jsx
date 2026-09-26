// pages/Maintenance/MaintenanceList.jsx
import api from '../../api/axiosConfig';
import styles from './MaintenanceList.module.css';

const formatCurrency = (v) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(v) || 0);

const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-AR');
};

const formatKm = (v) =>
  v != null ? `${Number(v).toLocaleString('es-AR')} km` : '—';

export default function MaintenanceList({ maintenances = [], loading, error, onEdit, refetch }) {
  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      await api.delete(`/maintenance/${id}`);
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

  if (maintenances.length === 0) {
    return (
      <div className={styles.state}>
        <p>No hay registros con esos filtros.</p>
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
            <th>Descripción</th>
            <th>Kilometraje</th>
            <th>Costo</th>
            <th aria-label="Acciones"></th>
          </tr>
        </thead>
        <tbody>
          {maintenances.map((m) => {
            const id = m._id || m.id;
            return (
              <tr key={id}>
                <td>{formatDate(m.fecha)}</td>
                <td>
                  <span className={styles.typeTag}>{m.tipo || '—'}</span>
                </td>
                <td>{m.descripcion || '—'}</td>
                <td className={styles.km}>{formatKm(m.kilometraje)}</td>
                <td className={styles.amount}>{formatCurrency(m.costo)}</td>
                <td className={styles.actionsCell}>
                  {onEdit && (
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => onEdit(m)}
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