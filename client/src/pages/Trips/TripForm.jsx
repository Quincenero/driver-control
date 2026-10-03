// pages/Trips/TripForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import api from '../../api/axiosConfig';
import { useTrips } from '../../hooks/useTrips';
import TripList from './TripList';
import TripSummary from './TripSummary';
import TripFilters from './TripFilters';
import TripEditModal from './TripEditModal';
import styles from './TripForm.module.css';

const localToday = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const FILTROS_DEFAULT = { periodo: 'hoy' };

export default function TripForm() {
  const [fecha, setFecha] = useState(localToday);
  const [hora, setHora] = useState('');
  const [plataforma, setPlataforma] = useState('Taxi');
  const [tipoPago, setTipoPago] = useState('efectivo');
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [filtros, setFiltros] = useState(FILTROS_DEFAULT);
  const [tripEditando, setTripEditando] = useState(null);

  const navigate = useNavigate();

  const {
    trips,
    loading: loadingList,
    error: listError,
    refetch,
  } = useTrips(filtros);

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
      await api.post('/trips', {
        fecha,
        hora: hora || undefined,
        plataforma,
        tipoPago,
        monto: montoNum,
      });
      setMonto('');
      setHora('');
      refetch();
    } catch (err) {
      if (err.response?.status === 401) return;
      setError(err.response?.data?.message || 'Error al registrar el viaje');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este viaje?')) return;
    try {
      await api.delete(`/trips/${id}`);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleSaved = () => {
    setTripEditando(null);
    refetch();
  };

  return (
    <div className={styles.formContainer}>
      <header className={styles.formHeader}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={16} />
          Volver
        </button>
        <h2 className={styles.formTitle}>
          Nuevo <span>Viaje</span>
        </h2>
      </header>

      <form className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="fecha">Fecha</label>
            <input
              id="fecha"
              type="date"
              className={styles.formInput}
              value={fecha}
              max={localToday()}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>          
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="plataforma">Plataforma</label>
            <select
              id="plataforma"
              className={styles.formSelect}
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value)}
            >
              <option value="Uber">Uber</option>
              <option value="Cabify">Cabify</option>
              <option value="Didi">Didi</option>
              <option value="Taxi">Taxi</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="tipoPago">Tipo de Pago</label>
            <select
              id="tipoPago"
              className={styles.formSelect}
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

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="monto">Monto</label>
          <input
            id="monto"
            type="number"
            className={styles.formInput}
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            required
          />
        </div>

        {error && (
          <div className={styles.formError} role="alert">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <span className={styles.spinner} />
                Guardando…
              </>
            ) : (
              <>
                <Save size={16} />
                Guardar Viaje
              </>
            )}
          </button>
        </div>
      </form>

      <section className={styles.listSection}>
        <header className={styles.listHeader}>
          <h3 className={styles.listTitle}>
            Historial
            {trips.length > 0 && (
              <span className={styles.listCount}> · {trips.length}</span>
            )}
          </h3>
        </header>

        <TripFilters
          filtros={filtros}
          onChange={setFiltros}
          onClear={() => setFiltros(FILTROS_DEFAULT)}
        />

        <TripSummary trips={trips} filtros={filtros} />

        <TripList
          trips={trips}
          loading={loadingList}
          error={listError}
          onEdit={setTripEditando}
          onDelete={handleDelete}
        />
      </section>

      {tripEditando && (
        <TripEditModal
        key={tripEditando._id || tripEditando.id}
          trip={tripEditando}
          onClose={() => setTripEditando(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}