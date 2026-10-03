// src/components/AppLayout.jsx
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  FileText,
  Droplet,
  Wrench,
  TrendingUp,
  Receipt,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { ComfortModeToggle } from './ComfortModeToggle';
import { useAuth } from '../hooks/useAuth';
import logoImg from '../assets/logo.svg';
import styles from './AppLayout.module.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vehiculos', label: 'Vehículos', icon: Car },
  { to: '/documentos', label: 'Documentos', icon: FileText },
  { to: '/nuevo-viaje', label: 'Viajes', icon: TrendingUp },
  { to: '/fuel', label: 'Combustible', icon: Droplet },
  { to: '/registrar-gasto', label: 'Gastos', icon: Receipt },
  { to: '/mantenimiento', label: 'Mantenimiento', icon: Wrench },
];

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const nombre = user?.name || user?.nombre || user?.username || 'Conductor';

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    try {
      await logout?.();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className={styles.layout}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          <button
            type="button"
            className={styles.burger}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <NavLink to="/dashboard" className={styles.logo}>
            <img src={logoImg} alt="Driver Control Pro" height={32} />
          </NavLink>

          <nav className={styles.navDesktop} aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                  }
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className={styles.userArea}>
            <ComfortModeToggle />

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `${styles.userBtn} ${isActive ? styles.userBtnActive : ''}`
              }
              title="Mi perfil"
            >
              <User size={16} aria-hidden="true" />
              <span className={styles.userName}>{nombre}</span>
            </NavLink>

            <button
              type="button"
              className={styles.logoutBtn}
              onClick={handleLogout}
              title="Cerrar sesión"
            >
              <LogOut size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className={styles.navMobile} aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `${styles.navMobileLink} ${
                      isActive ? styles.navMobileLinkActive : ''
                    }`
                  }
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <NavLink
              to="/profile"
              onClick={closeMenu}
              className={({ isActive }) =>
                `${styles.navMobileLink} ${
                  isActive ? styles.navMobileLinkActive : ''
                }`
              }
            >
              <User size={18} aria-hidden="true" />
              <span>Mi perfil</span>
            </NavLink>

            {/* ✅ Modo lectura cómoda: va una sola vez, después del último link */}
            <div className={styles.comfortWrapper}>
              <ComfortModeToggle />
            </div>

            <button
              type="button"
              className={styles.navMobileLogout}
              onClick={handleLogout}
            >
              <LogOut size={18} aria-hidden="true" />
              <span>Cerrar sesión</span>
            </button>
          </nav>
        )}
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}