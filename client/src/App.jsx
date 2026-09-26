import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { AppLayout } from './components/AppLayout';

import Login from './pages/Auth/Login/Login';
import Register from './pages/Auth/Register/Register';
import Profile from './pages/Profile/Profile';
import ForgotPassword from './pages/Auth/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword/ResetPassword';
import Dashboard from './pages/Dashboard/Dashboard';

import TripForm from './pages/Trips/TripForm';
import ExpenseForm from './pages/Expenses/ExpenseForm';
import MaintenanceForm from './pages/Maintenance/MaintenanceForm';

import FuelForm from './pages/Fuel/FuelForm';
import FuelSummary from './pages/Fuel/FuelSummary';

import Vehicles from './pages/Vehicles/Vehicles';
import Documents from './pages/Documents/Documents';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          color: 'var(--text-primary)',
        }}
      >
        Cargando…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protegidas: comparten el layout con la barra de navegación */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/nuevo-viaje" element={<TripForm />} />
            <Route path="/fuel" element={<FuelForm />} />
            <Route path="/fuel-summary" element={<FuelSummary />} />
            <Route path="/registrar-gasto" element={<ExpenseForm />} />
            <Route path="/mantenimiento" element={<MaintenanceForm />} />
            <Route path="/vehiculos" element={<Vehicles />} />
            <Route path="/documentos" element={<Documents />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;