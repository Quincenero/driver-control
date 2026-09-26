// src/components/DocumentAlerts.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ExternalLink,
  Check,
  ChevronRight,
} from 'lucide-react';
import {
  useDocumentAlerts,
  useAcknowledgeDocument,
} from '../hooks/useDocuments';
import {
  DOCUMENT_ICONS,
  daysUntil,
  relativeExpiration,
  statusColor,
  STATUS_LABELS,
} from '../utils/documents';
import styles from './DocumentAlerts.module.css';

export function DocumentAlerts({ maxVisible = 3 }) {
  const { alerts, loading } = useDocumentAlerts();
  const acknowledge = useAcknowledgeDocument();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  // Si está cargando, no existe, o no hay alertas → no renderizamos nada.
  // Esto evita el "flash" de un banner vacío al cargar.
  if (loading || !alerts || alerts.length === 0) return null;

  const visible = expanded ? alerts : alerts.slice(0, maxVisible);
  const hidden = alerts.length - visible.length;

  return (
    <section
      className={styles.container}
      aria-label="Documentos que requieren atención"
    >
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <AlertTriangle
            size={18}
            className={styles.headerIcon}
            aria-hidden="true"
          />
          <span className={styles.headerText}>
            {alerts.length} documento{alerts.length > 1 ? 's' : ''} requiere
            {alerts.length === 1 ? '' : 'n'} atención
          </span>
        </div>

        <button
          type="button"
          className={styles.viewAll}
          onClick={() => navigate('/documentos')}
        >
          Ver todos
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </header>

      <ul className={styles.list}>
        {visible.map((doc) => {
          const Icon = DOCUMENT_ICONS[doc.type] ?? AlertTriangle;
          const days = daysUntil(doc.expiresAt);
          const color = statusColor(doc.status);

          const vehicleLabel = doc.vehicle
            ? `${doc.vehicle.brand ?? ''} ${doc.vehicle.model ?? ''}`.trim() ||
              doc.vehicle.plate
            : null;

          return (
            <li
              key={doc._id}
              className={styles.item}
              style={{ '--status-color': color }}
            >
              <div className={styles.itemIcon}>
                <Icon size={18} aria-hidden="true" />
              </div>

              <div className={styles.itemBody}>
                <div className={styles.itemTitle}>
                  <span className={styles.typeName}>
                    {doc.typeLabel ?? doc.type}
                  </span>
                  {vehicleLabel && (
                    <span className={styles.vehicleLabel}>
                      · {vehicleLabel}
                    </span>
                  )}
                </div>
                <div className={styles.itemMeta}>
                  <span className={styles.statusChip}>
                    {STATUS_LABELS[doc.status] ?? doc.status}
                  </span>
                  <span className={styles.days}>
                    {relativeExpiration(days)}
                  </span>
                </div>
              </div>

              <div className={styles.itemActions}>
                {doc.renewalUrl && (
                  <a
                    href={doc.renewalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionBtn}
                    title="Ir al trámite"
                  >
                    <ExternalLink size={14} aria-hidden="true" />
                    <span className={styles.actionLabel}>Trámite</span>
                  </a>
                )}

                {doc.status === 'por_vencer' && (
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => acknowledge.mutate(doc._id)}
                    disabled={acknowledge.isPending}
                    title="Marcar como vista"
                  >
                    <Check size={14} aria-hidden="true" />
                    <span className={styles.actionLabel}>Visto</span>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {!expanded && hidden > 0 && (
        <button
          type="button"
          className={styles.showMore}
          onClick={() => setExpanded(true)}
        >
          Ver {hidden} más
        </button>
      )}
    </section>
  );
}