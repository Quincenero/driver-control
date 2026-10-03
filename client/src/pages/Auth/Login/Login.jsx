import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import styles from './Login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mensaje de éxito desde el registro
  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('El servidor está despertando. Esperá unos segundos e intentá de nuevo.');
      } else if (!err.response) {
        setError('No se pudo conectar con el servidor. Revisá tu conexión a internet.');
      } else if (err.response.status === 401) {
        setError(err.response.data?.message || 'Credenciales inválidas. Revisá tu correo y contraseña.');
      } else if (err.response.status >= 500) {
        setError('Hubo un problema en el servidor. Intentá de nuevo en unos minutos.');
      } else {
        setError(err.response.data?.message || 'No se pudo iniciar sesión. Intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1>🚗 Driver Control Pro</h1>
          <p>Inicia sesión para continuar</p>
        </div>

        {successMessage && <div className={styles.success}>{successMessage}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="correo@ejemplo.com"
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Tu contraseña"
            />
          </div>

          <div className={styles.forgotPassword}>
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}