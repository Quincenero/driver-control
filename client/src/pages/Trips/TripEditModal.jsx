// pages/Trips/TripEditModal.jsx
import { useEffect, useState } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import api from '../../api/axiosConfig';
import styles from './TripEditModal.module.css';

const toInputDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const toInputTime = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function TripEditModal({ trip, onClose, onSaved }) {
  const [fecha, setFecha] = useState(() => toInputDate(trip?.fecha));
  const [hora, setHora] = useState(() => toInputTime(trip?.fecha));
  const [plataforma, setPlataforma] = useState('Taxi');
  const [tipoPago, setTipoPago] = useState('efectivo');
  const [monto, setMonto] = useState(() => String(trip?.monto ?? ''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cerrar con Escape
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

    const montoNum = Number(monto);
    if (!Number.isFinite(montoNum) || montoNum <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }

    setLoading(true);
    try {
      const id = trip._id || trip.id;
      const res = await api.put(`/trips/${id}`, {
        fecha,
        hora: hora || undefined,
        plataforma,
        tipoPago,
        monto: montoNum,
      });
      onSaved(res.data?.trip);
    } catch (err) {
      if (err.response?.status === 401) return;
      setError(
        err.response?.data?.message || 'Error al actualizar el viaje'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!trip) return null;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <header className={styles.header}>
          <h3 className={styles.title}>Editar Viaje</h3>
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
              <label className={styles.label} htmlFor="edit-fecha">
                Fecha
              </label>
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
              <label className={styles.label} htmlFor="edit-hora">
                Hora
              </label>
              <input
                id="edit-hora"
                type="time"
                className={styles.input}
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label} htmlFor="edit-plataforma">
                Plataforma
              </label>
              <select
                id="edit-plataforma"
                className={styles.select}
                value={plataforma}
                onChange={(e) => setPlataforma(e.target.value)}
              >
                <option value="Uber">Uber</option>
                <option value="Cabify">Cabify</option>
                <option value="Didi">Didi</option>
                <option value="Taxi">Taxi</option>
              </select>
            </div>

            <div className={styles.group}>
              <label className={styles.label} htmlFor="edit-tipoPago">
                Tipo de Pago
              </label>
              <select
                id="edit-tipoPago"
                className={styles.select}
                value={tipoPago}
                onChange={(e) => setTipoPago(e.target.value)}
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta de crédito">Tarjeta de crédito</option>
                <option value="tarjeta de débito">Tarjeta de débito</option>
                <option value="App de pago">Pago por app</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          <div className={styles.group}>
            <label className={styles.label} htmlFor="edit-monto">
              Monto
            </label>
            <input
              id="edit-monto"
              type="number"
              className={styles.input}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              min="0.01"
              step="0.01"
              inputMode="decimal"
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
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={loading}
            >
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