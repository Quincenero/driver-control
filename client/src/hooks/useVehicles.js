// src/hooks/useVehicles.js
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { vehiclesApi } from '../api/vehicles';
import { messageFor } from './queryHelpers';

const KEYS = {
  all: ['vehicles'],
  list: ['vehicles', 'list'],
  active: ['vehicles', 'active'],
  detail: (id) => ['vehicles', 'detail', id],
};

const invalidateAll = (qc) => qc.invalidateQueries({ queryKey: KEYS.all });

// ---------- Queries ----------

export function useVehicles() {
  const query = useQuery({
    queryKey: KEYS.list,
    queryFn: () => vehiclesApi.list(),
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });

  return {
    vehicles: query.data ?? [],
    loading: query.isLoading,
    error: query.error
      ? messageFor(query.error, 'Error al cargar vehículos')
      : '',
    refetch: query.refetch,
  };
}

export function useActiveVehicle() {
  const query = useQuery({
    queryKey: KEYS.active,
    queryFn: () => vehiclesApi.active(),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });

  return {
    vehicle: query.data ?? null,
    loading: query.isLoading,
    error: query.error
      ? messageFor(query.error, 'Error al cargar vehículo')
      : '',
    refetch: query.refetch,
  };
}

export function useVehicle(id) {
  const query = useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => vehiclesApi.get(id),
    enabled: Boolean(id),
  });

  return {
    vehicle: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? messageFor(query.error) : '',
  };
}

// ---------- Mutations ----------

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: vehiclesApi.create,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => vehiclesApi.update(id, payload),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => vehiclesApi.remove(id),
    onSuccess: () => invalidateAll(qc),
  });
}