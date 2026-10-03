// components/ComfortModeToggle.jsx
import { Glasses } from 'lucide-react';
import { useComfortMode } from '../hooks/useComfortMode';
import styles from './ComfortModeToggle.module.css';

export function ComfortModeToggle({ compact = false }) {
  const { enabled, toggle } = useComfortMode();

  return (
    <button
      type="button"
      onClick={toggle}
      className={`${styles.btn} ${enabled ? styles.active : ''} ${
        compact ? styles.compact : ''
      }`}
      title={
        enabled
          ? 'Desactivar lectura cómoda'
          : 'Activar lectura cómoda (más contraste y trazo grueso)'
      }
      aria-pressed={enabled}
      aria-label={
        enabled ? 'Desactivar lectura cómoda' : 'Activar lectura cómoda'
      }
    >
      <Glasses size={16} aria-hidden="true" />
      {!compact && <span>{enabled ? 'Cómoda' : 'Lectura'}</span>}
    </button>
  );
}