// pages/Expenses/ExpenseEditModal.jsx
import { useEffect, useState } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import api from '../../api/axiosConfig';
import styles from './ExpenseEditModal.module.css';

const toInputDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export default function ExpenseEditModal({ expense, onClose, onSaved }) {
  const [category, setCategory] = useState(expense?.category || 'Peaje');
  const [amount, setAmount] = useState(() => String(expense?.amount ?? ''));
  const [description, setDescription] = useState(expense?.description || '');
  const [date, setDate] = useState(() => toInputDate(expense?.date));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [loading, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }

    setLoading(true);
    try {
      const id = expense._id || expense.id;
      const res = await api.put(`/expenses/${id}`, {
        category,
        amount: amountNum,
        description: description.trim(),
        date,
      });
      onSaved(res.data?.expense);
    } catch (err) {
      if (err.response?.status === 401) return;
      setError(err.response?.data?.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  if (!expense) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <header className={styles.header}>
          <h3 className={styles.title}>Editar Gasto</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose} disabled={loading} aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label} htmlFor="edit-date">Fecha</label>
              <input id="edit-date" type="date" className={styles.input} value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className={styles.group}>
              <label className={styles.label} htmlFor="edit-category">Categoría</label>
              <select id="edit-category" className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Peaje">Peaje</option>
                <option value="Lavado">Lavado</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="edit-amount">Monto</label>
            <input id="edit-amount" type="number" className={styles.input} value={amount} onChange={(e) => setAmount(e.target.value)} min="0.01" step="0.01" inputMode="decimal" required />
          </div>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="edit-description">Descripción</label>
            <input id="edit-description" type="text" className={styles.input} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} />
          </div>

          {error && (
            <div className={styles.error} role="alert">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? (<><span className={styles.spinner} />Guardando…</>) : (<><Save size={16} />Guardar cambios</>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}