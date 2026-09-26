import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { messageFor } from './queryHelpers';

const normalizeDistribution = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => ({
      name: item?.name ?? item?.categoria ?? item?.label ?? 'Sin categoría',
      value: Number(item?.value ?? item?.monto ?? item?.total) || 0,
    }))
    .filter((e) => e.value > 0);
};

export function useExpenses(filtros = { periodo: 'hoy' }) {
  const expensesQuery = useQuery({
    queryKey: ['expenses', filtros],
    queryFn: async ({ signal }) => {
      const res = await api.get('/expenses', { params: filtros, signal });
      return Array.isArray(res.data?.expenses) ? res.data.expenses : [];
    },
    placeholderData: keepPreviousData,
  });

  const summaryQuery = useQuery({
    queryKey: ['expenses-summary', { periodo: filtros.periodo }],
    queryFn: async ({ signal }) => {
      const res = await api.get('/expenses/summary', {
        params: { periodo: filtros.periodo },
        signal,
      });
      return normalizeDistribution(res.data?.summary);
    },
    placeholderData: keepPreviousData,
  });

  const distribution = summaryQuery.data ?? [];
  const total = distribution.reduce((s, e) => s + e.value, 0);

  return {
    expenses: expensesQuery.data ?? [],
    distribution,
    total,
    loading: expensesQuery.isLoading || summaryQuery.isLoading,
    error: expensesQuery.error
      ? messageFor(expensesQuery.error, 'Error al cargar gastos')
      : summaryQuery.error
      ? messageFor(summaryQuery.error, 'Error al cargar gastos')
      : '',
    refetch: () => {
      expensesQuery.refetch();
      summaryQuery.refetch();
    },
  };
}