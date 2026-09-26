import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { messageFor, sumValues } from './queryHelpers';

export function useExpensesTotal({ periodo = 'hoy' } = {}) {
  // Ojo: la key 'expenses-summary' es la MISMA que usa useExpenses.
  // React Query dedupe automáticamente → una sola request a /expenses/summary.
  const expensesQuery = useQuery({
    queryKey: ['expenses-summary', { periodo }],
    queryFn: async ({ signal }) => {
      const res = await api.get('/expenses/summary', {
        params: { periodo },
        signal,
      });
      return res.data?.summary ?? [];
    },
    placeholderData: keepPreviousData,
  });

  const fuelQuery = useQuery({
    queryKey: ['fuel-summary', { periodo }],
    queryFn: async ({ signal }) => {
      const res = await api.get('/fuel/summary', {
        params: { periodo },
        signal,
      });
      return res.data?.summary ?? [];
    },
    placeholderData: keepPreviousData,
  });

  const maintQuery = useQuery({
    queryKey: ['maintenance-summary', { periodo }],
    queryFn: async ({ signal }) => {
      const res = await api.get('/maintenance/summary', {
        params: { periodo },
        signal,
      });
      return res.data?.summary ?? [];
    },
    placeholderData: keepPreviousData,
  });

  const expenses = sumValues(expensesQuery.data);
  const fuel = sumValues(fuelQuery.data);
  const maintenance = sumValues(maintQuery.data);

  const firstError =
    expensesQuery.error || fuelQuery.error || maintQuery.error;

  return {
    expenses,
    fuel,
    maintenance,
    total: expenses + fuel + maintenance,
    loading:
      expensesQuery.isLoading || fuelQuery.isLoading || maintQuery.isLoading,
    error: firstError
      ? messageFor(firstError, 'Error al cargar gastos')
      : '',
    refetch: () => {
      expensesQuery.refetch();
      fuelQuery.refetch();
      maintQuery.refetch();
    },
  };
}