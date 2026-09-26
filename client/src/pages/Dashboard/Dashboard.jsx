// src/pages/Dashboard/Dashboard.jsx
import { useMemo, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTrips } from '../../hooks/useTrips';
import { useTripStats } from '../../hooks/useTripStats';
import { useExpenses } from '../../hooks/useExpenses';
import { useExpensesTotal } from '../../hooks/useExpensesTotal.js';
import { useActiveVehicle } from '../../hooks/useVehicles';
import { DocumentAlerts } from '../../components/DocumentAlerts';
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Car,
  Fuel,
  Award,
  Wrench,
  TrendingDown,
  Droplet,
  Plus,
} from 'lucide-react';

import styles from './Dashboard.module.css';
import { MetricCard } from './MetricCard';

const CHART_COLORS = ['#4ade80', '#60a5fa', '#fbbf24', '#f43f5e', '#a855f7'];

const PERIOD_LABELS = {
  hoy: 'Hoy',
  semana: 'Esta semana',
  mes: 'Este mes',
};

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('es-AR');

const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : dateFormatter.format(date);
};

const toMessage = (err) =>
  typeof err === 'string' ? err : err?.message || 'Error desconocido';

function FullScreenState({ variant = 'loading', message, detail }) {
  const className =
    variant === 'error' ? styles.errorState : styles.loadingState;
  const icon = variant === 'error' ? '❌' : '⏳';

  return (
    <div className={styles.dashboardContainer}>
      <div
        className={className}
        role={variant === 'error' ? 'alert' : 'status'}
        aria-live="polite"
      >
        <span aria-hidden="true">{icon}</span>
        <p>{message}</p>
        {detail && <small>{detail}</small>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [periodo, setPeriodo] = useState('hoy');
  const navigate = useNavigate();
  const { vehicle, loading: loadingVehicle } = useActiveVehicle();

  const {
    trips,
    loading: loadingTrips,
    error: tripsError,
  } = useTrips({ periodo });

  const {
    stats: serverStats,
    loading: loadingStats,
    error: statsError,
  } = useTripStats({ periodo });

  const {
    distribution,
    loading: loadingExpenses,
    error: expensesError,
  } = useExpenses({ periodo });

  const {
    total: totalGastos,
    fuel: totalFuel,
    maintenance: totalMaintenance,
    loading: loadingTotal,
    error: totalError,
  } = useExpensesTotal({ periodo });

  const datosViajes = useMemo(
    () => (Array.isArray(trips) ? trips : []),
    [trips]
  );

  const pieData = useMemo(
    () =>
      (Array.isArray(distribution) ? distribution : [])
        .map((entry, index) => ({
          ...entry,
          value: Number(entry?.value) || 0,
          fill: CHART_COLORS[index % CHART_COLORS.length],
        }))
        .filter((entry) => entry.value > 0),
    [distribution]
  );

  const stats = useMemo(() => {
    const totalIngresos = Number(serverStats?.totalIngresos) || 0;
    const viajes = Number(serverStats?.totalViajes) || 0;
    const promedio = Number(serverStats?.promedio) || 0;

    const utilidad = totalIngresos - totalGastos;
    const margen = totalIngresos > 0 ? (utilidad / totalIngresos) * 100 : 0;
    const pctCombustible =
      totalIngresos > 0 ? (totalFuel / totalIngresos) * 100 : 0;

    return {
      totalIngresos,
      totalGastos,
      utilidad,
      viajes,
      promedio,
      margen,
      pctCombustible,
    };
  }, [serverStats, totalGastos, totalFuel]);

  if (authLoading) {
    return <FullScreenState message="Verificando sesión…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const loading =
    loadingTrips || loadingExpenses || loadingTotal || loadingStats;
  const error = tripsError || expensesError || totalError || statsError;

  const isInitialLoad = loading && !serverStats && datosViajes.length === 0;

  if (isInitialLoad) {
    return <FullScreenState message="Cargando información del dashboard…" />;
  }

  if (error) {
    return (
      <FullScreenState
        variant="error"
        message="No fue posible cargar la información."
        detail={toMessage(error)}
      />
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <div className={styles.pageTitle}>
          <h1>Dashboard</h1>

          {vehicle ? (
            <span className={styles.vehicleTag}>
              <Car size={14} aria-hidden="true" />
              {vehicle.brand} {vehicle.model}
              <span className={styles.vehiclePlate}>{vehicle.plate}</span>
            </span>
          ) : (
            !loadingVehicle && (
              <button
                type="button"
                className={styles.vehicleCta}
                onClick={() => navigate('/vehiculos')}
              >
                <Plus size={14} aria-hidden="true" />
                Agregar vehículo
              </button>
            )
          )}
        </div>

        <div
          className={styles.headerRight}
          role="group"
          aria-label="Seleccionar período"
        >
          {Object.entries(PERIOD_LABELS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`${styles.periodBtn} ${
                periodo === value ? styles.active : ''
              }`}
              onClick={() => setPeriodo(value)}
              aria-pressed={periodo === value}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <DocumentAlerts maxVisible={3} />

      <main className={styles.dashboardContent} aria-busy={loading}>
        {loading && (
          <div className={styles.refetchBar} role="status" aria-live="polite">
            Actualizando…
          </div>
        )}

        <section
          className={styles.metricsGrid}
          aria-label="Métricas del período"
        >
          <MetricCard
            icon={DollarSign}
            color="#4ade80"
            label={`Ingresos ${PERIOD_LABELS[periodo]}`}
            value={formatCurrency(stats.totalIngresos)}
            sub="Total generado"
            positive
          />

          <MetricCard
            icon={Droplet}
            color="#06b6d4"
            label={`Combustible ${PERIOD_LABELS[periodo]}`}
            value={formatCurrency(totalFuel)}
            sub={
              stats.totalIngresos > 0
                ? `${stats.pctCombustible.toFixed(1)}% de ingresos`
                : 'Sin ingresos aún'
            }
          />

          <MetricCard
            icon={TrendingDown}
            color="#fbbf24"
            label={`Gastos ${PERIOD_LABELS[periodo]}`}
            value={formatCurrency(stats.totalGastos)}
            sub="Gastos registrados"
          />

          <MetricCard
            icon={TrendingUp}
            color="#60a5fa"
            label="Utilidad Neta"
            value={formatCurrency(stats.utilidad)}
            sub={`Margen: ${stats.margen.toFixed(1)}%`}
            positive={stats.utilidad >= 0}
          />

          <MetricCard
            icon={Car}
            color="#f43f5e"
            label="Viajes Realizados"
            value={stats.viajes}
            sub={PERIOD_LABELS[periodo]}
          />

          <MetricCard
            icon={Award}
            color="#a855f7"
            label="Promedio por Viaje"
            value={formatCurrency(stats.promedio)}
            sub={
              stats.viajes > 0 ? 'Promedio calculado' : 'Sin viajes registrados'
            }
          />

          <MetricCard
            icon={Wrench}
            color="#8b5cf6"
            label={`Mantenimiento ${PERIOD_LABELS[periodo]}`}
            value={formatCurrency(totalMaintenance)}
            sub="Services y reparaciones"
          />
        </section>

        <section className={styles.twoColumns}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Últimos Viajes Registrados</h3>
              <span className={styles.periodLabel}>
                {PERIOD_LABELS[periodo]}
              </span>
            </div>

            {datosViajes.length === 0 ? (
              <div className={styles.emptyState}>
                <Car size={32} aria-hidden="true" />
                <p>No hay viajes registrados.</p>
                <small>Los viajes que registres aparecerán aquí.</small>
              </div>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.tripsTable}>
                  <thead>
                    <tr>
                      <th scope="col">Fecha</th>
                      <th scope="col">Plataforma</th>
                      <th scope="col">Tipo de Pago</th>
                      <th scope="col">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosViajes.map((trip, index) => (
                      <tr key={trip?._id || trip?.id || index}>
                        <td>{formatDate(trip?.fecha)}</td>
                        <td>
                          <span className={styles.platformTag}>
                            {trip?.plataforma || 'N/A'}
                          </span>
                        </td>
                        <td>{trip?.tipoPago || 'N/A'}</td>
                        <td className={styles.amount}>
                          {formatCurrency(trip?.monto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Distribución de Gastos</h3>
              <span className={styles.periodLabel}>
                {PERIOD_LABELS[periodo]}
              </span>
            </div>

            {pieData.length === 0 ? (
              <div className={styles.emptyState}>
                <Fuel size={32} aria-hidden="true" />
                <p>No hay gastos registrados.</p>
                <small>
                  La distribución aparecerá cuando registres gastos.
                </small>
              </div>
            ) : (
              <div className={styles.pieChartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="42%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        background: '#1a1a2e',
                        border: '1px solid #2a2a3a',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend
                      position="bottom"
                      height={36}
                      formatter={(value) => (
                        <span
                          style={{ color: '#c8d0d8', fontSize: '0.75rem' }}
                        >
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        <section className={styles.quickActions} aria-label="Acciones rápidas">
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.primary}`}
            onClick={() => navigate('/nuevo-viaje')}
          >
            <Car size={18} aria-hidden="true" />
            Nuevo Viaje
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.secondary}`}
            onClick={() => navigate('/fuel')}
          >
            <Droplet size={18} aria-hidden="true" />
            Combustible
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.secondary}`}
            onClick={() => navigate('/registrar-gasto')}
          >
            <TrendingDown size={18} aria-hidden="true" />
            Registrar Gasto
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.secondary}`}
            onClick={() => navigate('/mantenimiento')}
          >
            <Wrench size={18} aria-hidden="true" />
            Mantenimiento
          </button>
        </section>
      </main>
    </div>
  );
}