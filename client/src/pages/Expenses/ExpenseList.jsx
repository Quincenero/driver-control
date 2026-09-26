// pages/Expenses/ExpenseList.jsx
import api from '../../api/axiosConfig';
import styles from './ExpenseList.module.css';

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

export default function ExpenseList({ expenses = [], loading, error, onEdit, refetch }) {
  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      refetch?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  if (loading) return <div className={styles.state}><p>Cargando…</p></div>;
  if (error) return <div className={styles.state} role="alert"><p style={{ color: 'var(--accent-red, #f43f5e)' }}>{error}</p></div>;
  if (expenses.length === 0) return <div className={styles.state}><p>No hay gastos con esos filtros.</p></div>;

  return (
    <div className={styles.tableResponsive}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Categoría</th>
            <th>Descripción</th>
            <th>Monto</th>
            <th aria-label="Acciones"></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => {
            const id = exp._id || exp.id;
            return (
              <tr key={id}>
                <td>{formatDate(exp.date)}</td>
                <td><span className={styles.categoryTag}>{exp.category || '—'}</span></td>
                <td>{exp.description || '—'}</td>
                <td className={styles.amount}>{formatCurrency(exp.amount)}</td>
                <td className={styles.actionsCell}>
                  {onEdit && (
                    <button type="button" className={styles.editBtn} onClick={() => onEdit(exp)} aria-label="Editar">✎</button>
                  )}
                  <button type="button" className={styles.deleteBtn} onClick={() => handleDelete(id)} aria-label="Eliminar">×</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}