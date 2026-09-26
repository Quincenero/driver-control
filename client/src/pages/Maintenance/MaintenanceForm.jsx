// pages/Maintenance/MaintenanceForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import api from '../../api/axiosConfig';
import { useMaintenances } from '../../hooks/useMaintenances';
import MaintenanceList from './MaintenanceList';
import MaintenanceFilters from './MaintenanceFilters';
import MaintenanceEditModal from './MaintenanceEditModal';
import styles from './MaintenanceForm.module.css';

const localToday = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const FILTROS_DEFAULT = { periodo: 'hoy' };

export default function MaintenanceForm() {
  const [tipo, setTipo] = useState('Aceite');
  const [costo, setCosto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [fecha, setFecha] = useState(localToday);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [filtros, setFiltros] = useState(FILTROS_DEFAULT);
  const [maintenanceEditando, setMaintenanceEditando] = useState(null);

  const navigate = useNavigate();

  const {
    maintenances,
    loading: loadingList,
    error: listError,
    refetch,
  } = useMaintenances(filtros);

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
      await api.post('/maintenance', {
        tipo,
        costo: costoNum,
        descripcion: descripcion.trim(),
        kilometraje: kmNum,
        fecha,
      });

      // Reset del form
      setCosto('');
      setDescripcion('');
      setKilometraje('');

      // ✅ Refresca la lista — NO redirige
      refetch();
    } catch (err) {
      if (err.response?.status === 401) return;
      setError(
        err.response?.data?.message || 'Error al registrar mantenimiento'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaved = () => {
    setMaintenanceEditando(null);
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
          Registrar <span>Mantenimiento</span>
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

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="costo">Costo</label>
            <input
              id="costo"
              type="number"
              className={styles.formInput}
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="kilometraje">
              Kilometraje <span className={styles.optional}>(opcional)</span>
            </label>
            <input
              id="kilometraje"
              type="number"
              className={styles.formInput}
              value={kilometraje}
              onChange={(e) => setKilometraje(e.target.value)}
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="Ej: 85000"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="descripcion">
            Descripción <span className={styles.optional}>(opcional)</span>
          </label>
          <input
            id="descripcion"
            type="text"
            className={styles.formInput}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej: Cambio de aceite 10W40 + filtro"
            maxLength={200}
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
                Guardar Mantenimiento
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
            {maintenances.length > 0 && (
              <span className={styles.listCount}> · {maintenances.length}</span>
            )}
          </h3>
        </header>

        <MaintenanceFilters
          filtros={filtros}
          onChange={setFiltros}
          onClear={() => setFiltros(FILTROS_DEFAULT)}
        />

        <MaintenanceList
          maintenances={maintenances}
          loading={loadingList}
          error={listError}
          onEdit={setMaintenanceEditando}
          refetch={refetch}
        />
      </section>

      {/* ================ MODAL DE EDICIÓN ================ */}
      {maintenanceEditando && (
        <MaintenanceEditModal
          key={maintenanceEditando._id || maintenanceEditando.id}
          maintenance={maintenanceEditando}
          onClose={() => setMaintenanceEditando(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}