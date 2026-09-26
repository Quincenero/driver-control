import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { messageFor } from './queryHelpers';

const EMPTY = { totalIngresos: 0, totalViajes: 0, promedio: 0 };

export function useTripStats({ periodo = 'hoy' } = {}) {
  const query = useQuery({
    queryKey: ['trips-stats', { periodo }],
    queryFn: async ({ signal }) => {
      const res = await api.get('/trips/stats', {
        params: { periodo },
        signal,
      });
      return res.data?.stats ?? EMPTY;
    },
    placeholderData: keepPreviousData,
  });

  return {
    stats: query.data ?? EMPTY,
    loading: query.isLoading,
    error: query.error
      ? messageFor(query.error, 'Error al cargar estadísticas')
      : '',
    refetch: query.refetch,
  };
}