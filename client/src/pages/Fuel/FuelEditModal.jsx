// pages/Fuel/FuelEditModal.jsx
import { useEffect, useState } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import api from '../../api/axiosConfig';
import styles from './FuelEditModal.module.css';

const toInputDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export default function FuelEditModal({ fuel, onClose, onSaved }) {
  const [tipo, setTipo] = useState(fuel?.tipo || 'Nafta');
  const [total, setTotal] = useState(() => String(fuel?.total ?? ''));
  const [lugarCarga, setLugarCarga] = useState(fuel?.lugarCarga || '');
  const [fecha, setFecha] = useState(() => toInputDate(fuel?.fecha));
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

    const totalNum = Number(total);
    if (!Number.isFinite(totalNum) || totalNum <= 0) {
      setError('Ingresa un total válido mayor a 0');
      return;
    }
    if (!lugarCarga.trim()) {
      setError('Ingresa el lugar de carga');
      return;
    }

    setLoading(true);
    try {
      const id = fuel._id || fuel.id;
      const res = await api.put(`/fuel/${id}`, {
        tipo,
        total: totalNum,
        lugarCarga: lugarCarga.trim(),
        fecha,
      });
      onSaved(res.data?.fuel);
    } catch (err) {
      if (err.response?.status === 401) return;
      setError(err.response?.data?.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  if (!fuel) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <header className={styles.header}>
          <h3 className={styles.title}>Editar Combustible</h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label} htmlFor="edit-fecha">Fecha</label>
              <input
                id="edit-fecha"
                type="date"
                className={styles.input}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>

            <div className={styles.group}>
              <label className={styles.label} htmlFor="edit-tipo">Tipo</label>
              <select
                id="edit-tipo"
                className={styles.select}
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="Nafta">Nafta</option>
                <option value="Diesel">Diesel</option>
                <option value="GNC">GNC</option>
                <option value="Eléctrico">Eléctrico</option>
              </select>
            </div>
          </div>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="edit-total">Total</label>
            <input
              id="edit-total"
              type="number"
              className={styles.input}
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              min="0.01"
              step="0.01"
              inputMode="decimal"
              required
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="edit-lugar">Lugar de carga</label>
            <input
              id="edit-lugar"
              type="text"
              className={styles.input}
              value={lugarCarga}
              onChange={(e) => setLugarCarga(e.target.value)}
              placeholder="Ej: YPF Av. Corrientes"
              maxLength={120}
              required
            />
          </div>

          {error && (
            <div className={styles.error} role="alert">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Guardando…
                </>
              ) : (
                <>
                  <Save size={16} />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}