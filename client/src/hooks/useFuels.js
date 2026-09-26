// hooks/useFuels.js
import { useCallback, useEffect, useState } from 'react';
import api from '../api/axiosConfig';

const EMPTY = [];

/**
 * @param {object} filtros
 * @param {string} filtros.periodo - 'hoy' | 'semana' | 'mes' | 'año'
 * @param {string} [filtros.tipo] - 'Nafta' | 'Diesel' | 'GNC' | 'Eléctrico'
 * @param {string} [filtros.fecha] - 'YYYY-MM-DD' (reemplaza periodo)
 */
export function useFuels(filtros = { periodo: 'hoy' }) {
  const [tick, setTick] = useState(0);

  const filtrosKey = JSON.stringify(filtros);
  const queryKey = `${filtrosKey}:${tick}`;

  const [state, setState] = useState({
    key: null,
    fuels: EMPTY,
    error: '',
  });

  const loading = state.key !== queryKey;

  useEffect(() => {
    const controller = new AbortController();
    let canceled = false;

    (async () => {
      try {
        const res = await api.get('/fuel', {
          params: filtros,
          signal: controller.signal,
        });
        if (canceled) return;
        setState({
          key: queryKey,
          fuels: Array.isArray(res.data?.fuels) ? res.data.fuels : EMPTY,
          error: '',
        });
      } catch (err) {
        if (canceled || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return;
        }
        const status = err.response?.status;
        const message =
          status === 401
            ? 'Sesión expirada'
            : err.response?.data?.message || 'Error al cargar combustibles';
        setState({ key: queryKey, fuels: EMPTY, error: message });
      }
    })();

    return () => {
      canceled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { fuels: state.fuels, loading, error: state.error, refetch };
}

export function useFuelSummary(periodo = 'hoy') {
  const [tick, setTick] = useState(0);
  const queryKey = `${periodo}:${tick}`;

  const [state, setState] = useState({
    key: null,
    summary: EMPTY,
    error: '',
  });

  const loading = state.key !== queryKey;

  useEffect(() => {
    const controller = new AbortController();
    let canceled = false;

    (async () => {
      try {
        const res = await api.get('/fuel/summary', {
          params: { periodo },
          signal: controller.signal,
        });
        if (canceled) return;
        setState({
          key: queryKey,
          summary: Array.isArray(res.data?.summary) ? res.data.summary : EMPTY,
          error: '',
        });
      } catch (err) {
        if (canceled || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return;
        }
        const status = err.response?.status;
        const message =
          status === 401
            ? 'Sesión expirada'
            : err.response?.data?.message || 'Error al cargar resumen';
        setState({ key: queryKey, summary: EMPTY, error: message });
      }
    })();

    return () => {
      canceled = true;
      controller.abort();
    };
  }, [periodo, queryKey]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { summary: state.summary, loading, error: state.error, refetch };
}