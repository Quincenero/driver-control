// hooks/useMaintenances.js
import { useCallback, useEffect, useState } from 'react';
import api from '../api/axiosConfig';

const EMPTY = [];

export function useMaintenances(filtros = { periodo: 'hoy' }) {
  const [tick, setTick] = useState(0);
  const filtrosKey = JSON.stringify(filtros);
  const queryKey = `${filtrosKey}:${tick}`;

  const [state, setState] = useState({
    key: null,
    maintenances: EMPTY,
    error: '',
  });

  const loading = state.key !== queryKey;

  useEffect(() => {
    const controller = new AbortController();
    let canceled = false;

    (async () => {
      try {
        const res = await api.get('/maintenance', {
          params: filtros,
          signal: controller.signal,
        });
        if (canceled) return;
        setState({
          key: queryKey,
          maintenances: Array.isArray(res.data?.maintenances) ? res.data.maintenances : EMPTY,
          error: '',
        });
      } catch (err) {
        if (canceled || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        const status = err.response?.status;
        const message =
          status === 401 ? 'Sesión expirada' : err.response?.data?.message || 'Error al cargar mantenimientos';
        setState({ key: queryKey, maintenances: EMPTY, error: message });
      }
    })();

    return () => { canceled = true; controller.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { maintenances: state.maintenances, loading, error: state.error, refetch };
}

export function useMaintenanceSummary(periodo = 'hoy') {
  const [tick, setTick] = useState(0);
  const queryKey = `${periodo}:${tick}`;
  const [state, setState] = useState({ key: null, summary: EMPTY, error: '' });
  const loading = state.key !== queryKey;

  useEffect(() => {
    const controller = new AbortController();
    let canceled = false;

    (async () => {
      try {
        const res = await api.get('/maintenance/summary', { params: { periodo }, signal: controller.signal });
        if (canceled) return;
        setState({ key: queryKey, summary: Array.isArray(res.data?.summary) ? res.data.summary : EMPTY, error: '' });
      } catch (err) {
        if (canceled || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        setState({ key: queryKey, summary: EMPTY, error: err.response?.data?.message || 'Error al cargar resumen' });
      }
    })();

    return () => { canceled = true; controller.abort(); };
  }, [periodo, queryKey]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { summary: state.summary, loading, error: state.error, refetch };
}