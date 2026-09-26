// src/context/AuthProvider.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from './AuthContext';

const TOKEN_KEY = 'token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  // ✅ Lazy initializer: si NO hay token, ya está "verificado" (no hay nada que chequear).
  // Si hay token, todavía no lo verificamos → false.
  const [authChecked, setAuthChecked] = useState(
    () => !localStorage.getItem(TOKEN_KEY)
  );

  // ✅ loading es DERIVADO, no un estado que se setea desde un effect.
  const loading = token ? !authChecked : false;

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setAuthChecked(true); // no hay token → ya está "verificado"
  }, []);

  // Escuchar expiración disparada por el interceptor de axios
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, [logout]);

  // Cargar perfil SOLO al montar si hay token
  useEffect(() => {
    if (!token) return; // ya está checked por el initializer

    const controller = new AbortController();
    let canceled = false;

    (async () => {
      try {
        const res = await api.get('/auth/me', { signal: controller.signal });
        if (!canceled) setUser(res.data.user);
      } catch (err) {
        if (canceled || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        if (import.meta.env.DEV) console.error('Error al cargar usuario:', err);
        if (!canceled) logout();
      } finally {
        // ✅ setState DESPUÉS del await → la regla no se queja
        if (!canceled) setAuthChecked(true);
      }
    })();

    return () => {
      canceled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo al montar

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
    setAuthChecked(true); // login ya trae el user, no hay que verificar
    return newUser;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
    setAuthChecked(true);
    return newUser;
  }, []);

  const updateProfile = useCallback(async (data) => {
    const res = await api.put('/auth/profile', data);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  }, []);

  const resetPassword = useCallback(async (resetToken, password) => {
    const res = await api.put(`/auth/reset-password/${resetToken}`, { password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
    setAuthChecked(true);
    return newUser;
  }, []);

  const value = useMemo(
    () => ({
      user, loading, token,
      login, register, logout, updateProfile, forgotPassword, resetPassword,
    }),
    [user, loading, token, login, register, logout, updateProfile, forgotPassword, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};