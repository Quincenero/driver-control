// src/pages/Vehicles.jsx
import { useState } from 'react';
import {
  Plus,
  Car,
  Pencil,
  Trash2,
  X,
  Gauge,
} from 'lucide-react';
import {
  useVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
} from '../../hooks/useVehicles';
import styles from './Vehicles.module.css';

const FUEL_LABELS = {
  nafta: 'Nafta',
  diesel: 'Diesel',
  gnc: 'GNC',
  hibrido: 'Híbrido',
  electrico: 'Eléctrico',
};

const STATUS_LABELS = {
  activo: 'Activo',
  inactivo: 'Inactivo',
  mantenimiento: 'En mantenimiento',
  baja: 'Dado de baja',
};

const emptyForm = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  plate: '',
  color: '',
  fuelType: 'nafta',
  status: 'activo',
  odometer: 0,
  notes: '',
};

function VehicleFormModal({ open, onClose, initial }) {
  const [form, setForm] = useState(() =>
    initial ? { ...emptyForm, ...initial } : emptyForm
  );
  const [submitError, setSubmitError] = useState('');

  const create = useCreateVehicle();
  const update = useUpdateVehicle();

  if (!open) return null;

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    try {
      if (initial?._id) {
        await update.mutateAsync({ id: initial._id, ...form });
      } else {
        await create.mutateAsync(form);
      }
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'No se pudo guardar el vehículo';
      setSubmitError(msg);
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className={styles.modalHeader}>
          <h2>{initial?._id ? 'Editar vehículo' : 'Nuevo vehículo'}</h2>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <label className={styles.field}>
              <span>Marca *</span>
              <input
                type="text"
                required
                maxLength={50}
                value={form.brand}
                onChange={(e) => set('brand', e.target.value)}
                placeholder="Toyota"
              />
            </label>
            <label className={styles.field}>
              <span>Modelo *</span>
              <input
                type="text"
                required
                maxLength={80}
                value={form.model}
                onChange={(e) => set('model', e.target.value)}
                placeholder="Corolla"
              />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
                <span>Año *</span>
                <input
                    type="number"
                    required
                    min={2006}
                    max={new Date().getFullYear() + 1}
                    value={form.year}
                    onChange={(e) => set('year', Number(e.target.value))}
                />
                </label>
            <label className={styles.field}>
              <span>Patente *</span>
              <input
                type="text"
                required
                maxLength={8}
                value={form.plate}
                onChange={(e) =>
                  set('plate', e.target.value.toUpperCase().replace(/\s/g, ''))
                }
                placeholder="AB123CD"
                style={{ textTransform: 'uppercase' }}
              />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Color</span>
              <input
                type="text"
                maxLength={30}
                value={form.color}
                onChange={(e) => set('color', e.target.value)}
                placeholder="Blanco"
              />
            </label>
            <label className={styles.field}>
              <span>Combustible</span>
              <select
                value={form.fuelType}
                onChange={(e) => set('fuelType', e.target.value)}
              >
                {Object.entries(FUEL_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Odómetro (km)</span>
              <input
                type="number"
                min={0}
                value={form.odometer}
                onChange={(e) => set('odometer', Number(e.target.value))}
              />
            </label>
            <label className={styles.field}>
              <span>Estado</span>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className={styles.field}>
            <span>Notas</span>
            <textarea
              rows={2}
              maxLength={500}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </label>

          {submitError && <div className={styles.error}>{submitError}</div>}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={isPending}
            >
              {isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Vehicles() {
  const { vehicles, loading, error } = useVehicles();
  const removeVehicle = useDeleteVehicle();
  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', vehicle? }

  const openCreate = () => setModal({ mode: 'create' });
  const openEdit = (vehicle) => setModal({ mode: 'edit', vehicle });
  const closeModal = () => setModal(null);

  const handleDelete = async (vehicle) => {
    if (
      !confirm(
        `¿Dar de baja el ${vehicle.brand} ${vehicle.model} (${vehicle.plate})?`
      )
    ) {
      return;
    }
    try {
      await removeVehicle.mutateAsync(vehicle._id);
    } catch (err) {
      alert(err?.response?.data?.message || 'No se pudo eliminar');
    }
  };

  const hasVehicles = vehicles.length > 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Car size={22} aria-hidden="true" />
          </div>
          <div>
            <h1>
              <span className={styles.titleAccent}>Mis</span> vehículos
            </h1>
            <p className={styles.subtitle}>
              Cargá tus autos para asociarlos a los documentos y viajes
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.btnPrimary}
          onClick={openCreate}
        >
          <Plus size={16} /> Nuevo vehículo
        </button>
      </header>

      {loading && <div className={styles.state}>Cargando vehículos…</div>}

      {error && <div className={styles.stateError}>{error}</div>}

      {!loading && !error && !hasVehicles && (
        <div className={styles.empty}>
          <Car size={40} aria-hidden="true" />
          <p>No tenés vehículos cargados.</p>
          <small>
            Agregá tu primer auto para empezar a registrar viajes, combustible
            y documentación.
          </small>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={openCreate}
          >
            <Plus size={16} /> Agregar vehículo
          </button>
        </div>
      )}

      {hasVehicles && (
        <div className={styles.grid}>
          {vehicles.map((v) => (
            <article key={v._id} className={styles.card}>
              <header className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <Car size={22} aria-hidden="true" />
                </div>
                <div className={styles.cardTitle}>
                  <h3>
                    {v.brand} {v.model}
                  </h3>
                  <span className={styles.cardYear}>{v.year}</span>
                </div>
                <span
                  className={`${styles.statusChip} ${
                    v.status === 'activo' ? styles.statusActive : ''
                  }`}
                >
                  {STATUS_LABELS[v.status] ?? v.status}
                </span>
              </header>

              <dl className={styles.cardBody}>
                <div>
                  <dt>Patente</dt>
                  <dd className={styles.plate}>{v.plate}</dd>
                </div>
                <div>
                  <dt>Combustible</dt>
                  <dd>{FUEL_LABELS[v.fuelType] ?? v.fuelType}</dd>
                </div>
                {v.color && (
                  <div>
                    <dt>Color</dt>
                    <dd>{v.color}</dd>
                  </div>
                )}
                {v.odometer > 0 && (
                  <div>
                    <dt>Odómetro</dt>
                    <dd className={styles.odometer}>
                      <Gauge size={13} /> {v.odometer.toLocaleString('es-AR')} km
                    </dd>
                  </div>
                )}
              </dl>

              <footer className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => openEdit(v)}
                >
                  <Pencil size={14} /> Editar
                </button>
                <button
                  type="button"
                  className={styles.btnDanger}
                  onClick={() => handleDelete(v)}
                  disabled={removeVehicle.isPending}
                >
                  <Trash2 size={14} /> Dar de baja
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}

      {modal && (
        <VehicleFormModal
          open
          onClose={closeModal}
          initial={modal.vehicle ?? null}
        />
      )}
    </div>
  );
}