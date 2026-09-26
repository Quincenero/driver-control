// src/pages/Profile/Profile.jsx
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ActiveVehicleCard } from '../../components/ActiveVehicleCard';
import styles from './Profile.module.css';

function ProfileForm({ user, onSave, onLogout }) {
  const [formData, setFormData] = useState({
    lastName: user.lastName || '',
    phone: user.phone || '',
    birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await onSave(formData);
      setMessage('Perfil actualizado correctamente');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {message && <div className={styles.success}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Nombre</label>
          <input type="text" value={user.name} disabled />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="lastName">Apellido</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Apellido (opcional)"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Teléfono</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+123456789"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="birthDate">Fecha de nacimiento</label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <section className={styles.vehicleSection}>
        <h2 className={styles.sectionTitle}>Mi vehículo</h2>
        <ActiveVehicleCard />
      </section>

      <button onClick={onLogout} className={styles.logoutBtn}>
        Cerrar sesión
      </button>
    </>
  );
}

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();

  if (!user) return <div>Cargando...</div>;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <h1>Mi Perfil</h1>
        <p>{user.email}</p>
        <ProfileForm
          key={user._id}
          user={user}
          onSave={updateProfile}
          onLogout={logout}
        />
      </div>
    </div>
  );
}