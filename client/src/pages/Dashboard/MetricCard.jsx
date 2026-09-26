
import styles from './MetricCard.module.css';

export function MetricCard({ icon: Icon, color, label, value, sub, positive }) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricIcon} style={{ background: `${color}25` }}>
        <Icon size={22} color={color} />
      </div>
      <div className={styles.metricContent}>
        <span className={styles.metricLabel}>{label}</span>
        <span
          className={`${styles.metricValue} ${
            positive === true ? styles.positive : positive === false ? styles.negative : ''
          }`}
        >
          {value}
        </span>
        {sub && <span className={styles.metricSub}>{sub}</span>}
      </div>
    </div>
  );
}
