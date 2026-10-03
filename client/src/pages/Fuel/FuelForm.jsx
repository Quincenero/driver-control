// pages/Fuel/FuelForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import api from '../../api/axiosConfig';
import { useFuels } from '../../hooks/useFuels';
import FuelList from './FuelList';
import FuelFilters from './FuelFilters';
import FuelEditModal from './FuelEditModal';
import styles from './FuelForm.module.css';

const localToday = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const FILTROS_DEFAULT = { periodo: 'hoy' };

export default function FuelForm() {
  const [tipo, setTipo] = useState('GNC');
  const [total, setTotal] = useState('');
  const [lugarCarga, setLugarCarga] = useState('');
  const [fecha, setFecha] = useState(localToday);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [filtros, setFiltros] = useState(FILTROS_DEFAULT);
  const [fuelEditando, setFuelEditando] = useState(null);

  const navigate = useNavigate();

  const {
    fuels,
    loading: loadingList,
    error: listError,
    refetch,
  } = useFuels(filtros);

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
      await api.post('/fuel', {
        tipo,
        total: totalNum,
        lugarCarga: lugarCarga.trim(),
        fecha,
      });
      setTotal('');
      setLugarCarga('');
      setTipo('GNC');
      refetch();
    } catch (err) {
      if (err.response?.status === 401) return;
      setError(err.response?.data?.message || 'Error al registrar combustible');
    } finally {
      setLoading(false);
    }
  };

  const handleSaved = () => {
    setFuelEditando(null);
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
          Registrar <span>Combustible</span>
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

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="tipo">Tipo</label>
            <select
              id="tipo"
              className={styles.formSelect}
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="GNC">GNC</option>
              <option value="Nafta">Nafta</option>
              <option value="Diesel">Diesel</option>              
              <option value="Eléctrico">Eléctrico</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="total">Total pagado</label>
          <input
            id="total"
            type="number"
            className={styles.formInput}
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="lugarCarga">Lugar de carga</label>
          <input
            id="lugarCarga"
            type="text"
            className={styles.formInput}
            value={lugarCarga}
            onChange={(e) => setLugarCarga(e.target.value)}
            placeholder="Ej: YPF Av. Corrientes"
            maxLength={120}
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
                Guardar Combustible
              </>
            )}
          </button>
        </div>
      </form>

      {/* ================ HISTORIAL ================ */}
      <section className={styles.listSection}>
        <header className={styles.listHeader}>
          <h3 className={styles.listTitle}>
            Historial
            {fuels.length > 0 && (
              <span className={styles.listCount}> · {fuels.length}</span>
            )}
          </h3>
        </header>

        <FuelFilters
          filtros={filtros}
          onChange={setFiltros}
          onClear={() => setFiltros(FILTROS_DEFAULT)}
        />

        <FuelList
          fuels={fuels}
          loading={loadingList}
          error={listError}
          onEdit={setFuelEditando}
          refetch={refetch}
        />
      </section>

      {/* ================ MODAL DE EDICIÓN ================ */}
      {fuelEditando && (
        <FuelEditModal
          key={fuelEditando._id || fuelEditando.id}
          fuel={fuelEditando}
          onClose={() => setFuelEditando(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}