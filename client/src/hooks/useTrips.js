import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { messageFor } from './queryHelpers';

export function useTrips(filtros = { periodo: 'hoy' }) {
  const query = useQuery({
    queryKey: ['trips', filtros],
    queryFn: async ({ signal }) => {
      const res = await api.get('/trips', { params: filtros, signal });
      return Array.isArray(res.data?.trips) ? res.data.trips : [];
    },
    placeholderData: keepPreviousData,
  });

  return {
    trips: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? messageFor(query.error, 'Error al cargar viajes') : '',
    refetch: query.refetch,
  };
}