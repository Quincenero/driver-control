// src/components/ActiveVehicleCard.jsx
import { useNavigate } from 'react-router-dom';
import { Car, Gauge, Plus, Settings } from 'lucide-react';
import { useActiveVehicle } from '../hooks/useVehicles';
import styles from './ActiveVehicleCard.module.css';

const FUEL_LABELS = {
  nafta: 'Nafta',
  diesel: 'Diesel',
  gnc: 'GNC',
  hibrido: 'Híbrido',
  electrico: 'Eléctrico',
};

export function ActiveVehicleCard({ compact = false }) {
  const { vehicle, loading } = useActiveVehicle();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className={`${styles.card} ${compact ? styles.compact : ''}`}>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className={`${styles.card} ${styles.empty} ${compact ? styles.compact : ''}`}>
        <div className={styles.emptyIcon}>
          <Car size={24} aria-hidden="true" />
        </div>
        <div className={styles.emptyBody}>
          <p>Todavía no cargaste un vehículo</p>
          <small>Agregalo para asociar viajes, combustible y documentos.</small>
        </div>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={() => navigate('/vehiculos')}
        >
          <Plus size={16} /> Agregar vehículo
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.card} ${compact ? styles.compact : ''}`}>
      <div className={styles.icon}>
        <Car size={22} aria-hidden="true" />
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>
          {vehicle.brand} {vehicle.model}
          <span className={styles.year}> {vehicle.year}</span>
        </h3>
        <div className={styles.meta}>
          <span className={styles.plate}>{vehicle.plate}</span>
          <span className={styles.dot}>·</span>
          <span>{FUEL_LABELS[vehicle.fuelType] ?? vehicle.fuelType}</span>
          {vehicle.odometer > 0 && (
            <>
              <span className={styles.dot}>·</span>
              <span className={styles.odometer}>
                <Gauge size={12} aria-hidden="true" />
                {vehicle.odometer.toLocaleString('es-AR')} km
              </span>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        className={styles.btnManage}
        onClick={() => navigate('/vehiculos')}
        title="Gestionar vehículos"
      >
        <Settings size={16} aria-hidden="true" />
        <span className={styles.btnManageLabel}>Gestionar</span>
      </button>
    </div>
  );
}