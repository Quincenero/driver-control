// pages/Maintenance/MaintenanceEditModal.jsx
import { useEffect, useState } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import api from '../../api/axiosConfig';
import styles from './MaintenanceEditModal.module.css';

const toInputDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export default function MaintenanceEditModal({ maintenance, onClose, onSaved }) {
  const [tipo, setTipo] = useState(maintenance?.tipo || 'Aceite');
  const [costo, setCosto] = useState(() => String(maintenance?.costo ?? ''));
  const [descripcion, setDescripcion] = useState(maintenance?.descripcion || '');
  const [kilometraje, setKilometraje] = useState(() =>
    maintenance?.kilometraje != null ? String(maintenance.kilometraje) : ''
  );
  const [fecha, setFecha] = useState(() => toInputDate(maintenance?.fecha));
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

    const costoNum = Number(costo);
    if (!Number.isFinite(costoNum) || costoNum <= 0) {
      setError('Ingresa un costo válido mayor a 0');
      return;
    }

    const kmNum = kilometraje === '' ? undefined : Number(kilometraje);
    if (kmNum !== undefined && (!Number.isFinite(kmNum) || kmNum < 0)) {
      setError('Kilometraje inválido');
      return;
    }

    setLoading(true);
    try {
      const id = maintenance._id || maintenance.id;
      const res = await api.put(`/maintenance/${id}`, {
        tipo,
        costo: costoNum,
        descripcion: descripcion.trim(),
        kilometraje: kmNum,
        fecha,
      });
      onSaved(res.data?.maintenance);
    } catch (err) {
      if (err.response?.status === 401) return;
      setError(err.response?.data?.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  if (!maintenance) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <header className={styles.header}>
          <h3 className={styles.title}>Editar Mantenimiento</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose} disabled={loading} aria-label="Cerrar">
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
                <option value="Aceite">Aceite</option>
                <option value="Frenos">Frenos</option>
                <option value="Neumáticos">Neumáticos</option>
                <option value="Filtros">Filtros</option>
                <option value="Batería">Batería</option>
                <option value="Service">Service</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label} htmlFor="edit-costo">Costo</label>
              <input
                id="edit-costo"
                type="number"
                className={styles.input}
                value={costo}
                onChange={(e) => setCosto(e.target.value)}
                min="0.01"
                step="0.01"
                inputMode="decimal"
                required
              />
            </div>

            <div className={styles.group}>
              <label className={styles.label} htmlFor="edit-kilometraje">
                Kilometraje <span style={{ opacity: 0.6 }}>(opcional)</span>
              </label>
              <input
                id="edit-kilometraje"
                type="number"
                className={styles.input}
                value={kilometraje}
                onChange={(e) => setKilometraje(e.target.value)}
                min="0"
                step="1"
                inputMode="numeric"
                placeholder="Ej: 85000"
              />
            </div>
          </div>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="edit-descripcion">
              Descripción <span style={{ opacity: 0.6 }}>(opcional)</span>
            </label>
            <input
              id="edit-descripcion"
              type="text"
              className={styles.input}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Cambio de aceite 10W40 + filtro"
              maxLength={200}
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