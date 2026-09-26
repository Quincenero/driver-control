// src/hooks/useDocuments.js
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { documentsApi } from '../api/documents';
import { messageFor } from './queryHelpers';

const KEYS = {
  types: ['documents', 'types'],
  list: ['documents', 'list'],
  alerts: ['documents', 'alerts'],
  history: (params) => ['documents', 'history', params],
};

const invalidateAll = (qc) =>
  qc.invalidateQueries({ queryKey: ['documents'] });

// ---------- Queries ----------

export function useDocumentTypes() {
  const query = useQuery({
    queryKey: KEYS.types,
    queryFn: () => documentsApi.getTypes(),
    staleTime: 60 * 60_000, // metadata, no cambia
  });
  return {
    types: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? messageFor(query.error) : '',
  };
}

export function useDocuments() {
  const query = useQuery({
    queryKey: KEYS.list,
    queryFn: () => documentsApi.list(),
    placeholderData: keepPreviousData,
  });
  return {
    documents: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? messageFor(query.error, 'Error al cargar documentos') : '',
    refetch: query.refetch,
  };
}

export function useDocumentAlerts() {
  const query = useQuery({
    queryKey: KEYS.alerts,
    queryFn: () => documentsApi.alerts(),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
  return {
    alerts: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? messageFor(query.error) : '',
    refetch: query.refetch,
  };
}

export function useDocumentHistory({ type, vehicle } = {}) {
  const query = useQuery({
    queryKey: KEYS.history({ type, vehicle }),
    queryFn: () => documentsApi.history({ type, vehicle }),
    enabled: Boolean(type),
  });
  return {
    history: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? messageFor(query.error) : '',
  };
}

// ---------- Mutations ----------

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: documentsApi.create,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => documentsApi.update(id, payload),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useRenewDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => documentsApi.renew(id, payload),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useAcknowledgeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => documentsApi.acknowledge(id),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useArchiveDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => documentsApi.archive(id),
    onSuccess: () => invalidateAll(qc),
  });
}