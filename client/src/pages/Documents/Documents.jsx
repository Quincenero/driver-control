// src/pages/Documents/Documents.jsx
import { useMemo, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  FileText,
} from 'lucide-react';
import {
  useDocuments,
  useDocumentTypes,
  useCreateDocument,
  useUpdateDocument,
  useRenewDocument,
  useArchiveDocument,
} from '../../hooks/useDocuments';
import { useVehicles } from '../../hooks/useVehicles';
import {
  DOCUMENT_ICONS,
  PERIOD_LABELS,
  STATUS_LABELS,
  calculateExpiresAt,
  daysUntil,
  formatDate,
  relativeExpiration,
  statusColor,
} from '../../utils/documents';
import styles from './Documents.module.css';

const FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'vigente', label: 'Vigentes' },
  { value: 'por_vencer', label: 'Por vencer' },
  { value: 'vencido', label: 'Vencidos' },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyForm = (type = 'vtv', meta = {}) => ({
  type,
  vehicle: '',
  number: '',
  issuedBy: '',
  issueDate: todayISO(),
  periodicity: meta.defaultPeriodicity ?? 'anual',
  reminderDays: meta.defaultReminderDays ?? 30,
  renewalUrl: meta.renewalUrl ?? '',
  notes: '',
});

function DocumentFormModal({ open, onClose, initial, vehicles, types }) {
  const isRenew = Boolean(initial?.__renew);
  const isEdit = Boolean(initial?._id) && !isRenew;

  const initialType = initial?.type ?? 'vtv';
  const initialMeta = types.find((t) => t.value === initialType) ?? {};

  const [form, setForm] = useState(() => {
    if (!initial) return emptyForm(initialType, initialMeta);

    return {
      ...emptyForm(initial.type, initialMeta),
      type: initial.type,
      vehicle: initial.vehicle?._id ?? initial.vehicle ?? '',
      number: initial.number ?? '',
      issuedBy: initial.issuedBy ?? '',
      issueDate: isRenew ? todayISO() : initial.issueDate?.slice(0, 10) ?? todayISO(),
      periodicity: initial.periodicity ?? 'anual',
      reminderDays: initial.reminderDays ?? 30,
      renewalUrl: initial.renewalUrl ?? '',
      notes: isRenew ? '' : initial.notes ?? '',
    };
  });
  const [submitError, setSubmitError] = useState('');

    const create = useCreateDocument();
  const update = useUpdateDocument();
  const renew = useRenewDocument();

  const computedExpiry = useMemo(
    () => calculateExpiresAt(form.issueDate, form.periodicity),
    [form.issueDate, form.periodicity]
  );

  if (!open) return null;

  const selectedType = types.find((t) => t.value === form.type);
  const needsVehicle = selectedType?.scope === 'vehicle';

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleTypeChange = (value) => {
    const meta = types.find((t) => t.value === value);
    setForm((f) => ({
      ...f,
      type: value,
      periodicity: meta?.defaultPeriodicity ?? f.periodicity,
      reminderDays: meta?.defaultReminderDays ?? f.reminderDays,
      renewalUrl: meta?.renewalUrl ?? f.renewalUrl,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const payload = {
      ...form,
      vehicle: needsVehicle ? form.vehicle || null : null,
    };

    try {
      if (isRenew) {
        await renew.mutateAsync({ id: initial._id, ...payload });
      } else if (isEdit) {
        await update.mutateAsync({ id: initial._id, ...payload });
      } else {
        await create.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'No se pudo guardar el documento';
      setSubmitError(msg);
    }
  };

  const isPending = create.isPending || update.isPending || renew.isPending;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className={styles.modalHeader}>
          <h2>
            {isRenew
              ? 'Registrar renovación'
              : isEdit
              ? 'Editar documento'
              : 'Nuevo documento'}
          </h2>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </header>

        {isRenew && (
          <p className={styles.renewNotice}>
            El documento actual quedará archivado y se creará uno nuevo con los
            datos de esta renovación.
          </p>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>Tipo *</span>
            <select
              value={form.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              disabled={isRenew || isEdit}
            >
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          {needsVehicle && (
            <label className={styles.field}>
              <span>Vehículo *</span>
              <select
                value={form.vehicle}
                onChange={(e) => set('vehicle', e.target.value)}
                required
              >
                <option value="">Seleccioná un vehículo</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.brand} {v.model} ({v.plate})
                  </option>
                ))}
              </select>
              {vehicles.length === 0 && (
                <small className={styles.hint}>
                  Primero cargá un vehículo en “Vehículos”.
                </small>
              )}
            </label>
          )}

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Número / Póliza</span>
              <input
                type="text"
                value={form.number}
                onChange={(e) => set('number', e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Emitido por</span>
              <input
                type="text"
                value={form.issuedBy}
                onChange={(e) => set('issuedBy', e.target.value)}
              />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Fecha de emisión *</span>
              <input
                type="date"
                value={form.issueDate}
                onChange={(e) => set('issueDate', e.target.value)}
                required
              />
            </label>
            <label className={styles.field}>
              <span>Periodicidad</span>
              <select
                value={form.periodicity}
                onChange={(e) => set('periodicity', e.target.value)}
              >
                {Object.entries(PERIOD_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {computedExpiry && (
            <div className={styles.expiryPreview}>
              Vence el <strong>{formatDate(computedExpiry)}</strong>
            </div>
          )}

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Avisar con (días de anticipación)</span>
              <input
                type="number"
                min={0}
                max={365}
                value={form.reminderDays}
                onChange={(e) => set('reminderDays', Number(e.target.value))}
              />
            </label>
            <label className={styles.field}>
              <span>Link de trámite (opcional)</span>
              <input
                type="url"
                value={form.renewalUrl}
                onChange={(e) => set('renewalUrl', e.target.value)}
                placeholder="https://…"
              />
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
              disabled={
                isPending || (needsVehicle && !form.vehicle)
              }
            >
              {isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Documents() {
  const [filter, setFilter] = useState('todos');
  const [modal, setModal] = useState(null);

  const { documents, loading, error } = useDocuments();
  const { types } = useDocumentTypes();
  const { vehicles } = useVehicles();
  const archive = useArchiveDocument();

  const filtered = useMemo(() => {
    if (filter === 'todos') return documents;
    return documents.filter((d) => d.status === filter);
  }, [documents, filter]);

  const counts = useMemo(() => {
    const base = { todos: documents.length };
    for (const d of documents) base[d.status] = (base[d.status] ?? 0) + 1;
    return base;
  }, [documents]);

  const openCreate = () => setModal({ mode: 'create', doc: null });
  const openEdit = (doc) => setModal({ mode: 'edit', doc });
  const openRenew = (doc) =>
    setModal({ mode: 'renew', doc: { ...doc, __renew: true } });
  const closeModal = () => setModal(null);

  const handleArchive = async (doc) => {
    const label = doc.typeLabel ?? doc.type;
    if (!confirm(`¿Archivar "${label}"? Se guardará en el historial.`)) return;
    try {
      await archive.mutateAsync(doc._id);
    } catch (err) {
      alert(err?.response?.data?.message || 'No se pudo archivar');
    }
  };

  // Esperamos los types antes de mostrar el botón "Nuevo" porque el form
  // los necesita para renderizar los selects.
  const typesReady = types.length > 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>
            <span>Mis </span>Documentos</h1>
          <p className={styles.subtitle}>
            VTV, licencias, seguro y habilitaciones
          </p>
        </div>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={openCreate}
          disabled={!typesReady}
        >
          <Plus size={16} /> Nuevo documento
        </button>
      </header>

      <nav className={styles.filters} aria-label="Filtrar documentos">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`${styles.filterBtn} ${
              filter === f.value ? styles.filterActive : ''
            }`}
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
          >
            {f.label}
            {counts[f.value] > 0 && (
              <span className={styles.count}>{counts[f.value]}</span>
            )}
          </button>
        ))}
      </nav>

      {loading && <div className={styles.state}>Cargando documentos…</div>}

      {error && <div className={styles.stateError}>{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className={styles.empty}>
          <FileText size={40} aria-hidden="true" />
          <p>
            No hay documentos
            {filter !== 'todos' ? ' en este filtro' : ''}.
          </p>
          <small>
            Agregá tu primer documento con el botón “Nuevo documento”.
          </small>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className={styles.grid}>
          {filtered.map((doc) => {
            const Icon = DOCUMENT_ICONS[doc.type] ?? FileText;
            const days = daysUntil(doc.expiresAt);
            const color = statusColor(doc.status);
            const vehicleLabel = doc.vehicle
              ? `${doc.vehicle.brand ?? ''} ${doc.vehicle.model ?? ''} (${
                  doc.vehicle.plate ?? ''
                })`.trim()
              : null;

            return (
              <article
                key={doc._id}
                className={styles.card}
                style={{ '--status-color': color }}
              >
                <header className={styles.cardHeader}>
                  <div className={styles.cardIcon}>
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div className={styles.cardTitle}>
                    <h3>{doc.typeLabel ?? doc.type}</h3>
                    {vehicleLabel && (
                      <span className={styles.cardVehicle}>{vehicleLabel}</span>
                    )}
                  </div>
                  <span className={styles.statusChip}>
                    {STATUS_LABELS[doc.status] ?? doc.status}
                  </span>
                </header>

                <dl className={styles.cardBody}>
                  <div>
                    <dt>Vence</dt>
                    <dd>{formatDate(doc.expiresAt)}</dd>
                  </div>
                  <div>
                    <dt>Estado</dt>
                    <dd style={{ color }}>{relativeExpiration(days)}</dd>
                  </div>
                  {doc.number && (
                    <div>
                      <dt>Número</dt>
                      <dd>{doc.number}</dd>
                    </div>
                  )}
                  {doc.issuedBy && (
                    <div>
                      <dt>Emitido por</dt>
                      <dd>{doc.issuedBy}</dd>
                    </div>
                  )}
                </dl>

                <footer className={styles.cardActions}>
                  {doc.renewalUrl && (
                    <a
                      href={doc.renewalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnGhost}
                    >
                      Trámite
                    </a>
                  )}
                  <button
                    type="button"
                    className={styles.btnGhost}
                    onClick={() => openRenew(doc)}
                  >
                    <RefreshCw size={14} /> Renovar
                  </button>
                  <button
                    type="button"
                    className={styles.btnGhost}
                    onClick={() => openEdit(doc)}
                  >
                    <Pencil size={14} /> Editar
                  </button>
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => handleArchive(doc)}
                    disabled={archive.isPending}
                  >
                    <Trash2 size={14} /> Archivar
                  </button>
                </footer>
              </article>
            );
          })}
        </div>
      )}

      {modal && (
        <DocumentFormModal
          open
          onClose={closeModal}
          initial={modal.doc}
          vehicles={vehicles}
          types={types}
        />
      )}
    </div>
  );
}