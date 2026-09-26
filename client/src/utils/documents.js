// src/utils/documents.js
import {
  ClipboardCheck,
  Car,
  IdCard,
  ShieldCheck,
  Flame,
  Gauge,
} from 'lucide-react';

export const DOCUMENT_ICONS = {
  vtv: ClipboardCheck,
  taxi_license: Car,
  driver_license: IdCard,
  insurance: ShieldCheck,
  gnc_sticker: Flame,
  hydraulic_test: Gauge,
};

export const PERIOD_TO_MONTHS = {
  mensual: 1,
  bimestral: 2,
  trimestral: 3,
  semestral: 6,
  anual: 12,
  bianual: 24,
  trienal: 36,
  cuatrienal: 48,
  quinquenal: 60,
};

export const PERIOD_LABELS = {
  mensual: 'Mensual',
  bimestral: 'Bimestral',
  trimestral: 'Trimestral',
  semestral: 'Semestral',
  anual: 'Anual',
  bianual: 'Bianual',
  trienal: 'Trienal',
  cuatrienal: 'Cuatrienal',
  quinquenal: 'Quinquenal',
};

export const STATUS_LABELS = {
  vigente: 'Vigente',
  por_vencer: 'Por vencer',
  vencido: 'Vencido',
  archivado: 'Archivado',
};

const dateFmt = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : dateFmt.format(d);
};

export const calculateExpiresAt = (issueDate, periodicity) => {
  if (!issueDate || !periodicity) return null;
  const months = PERIOD_TO_MONTHS[periodicity];
  if (!months) return null;
  const d = new Date(issueDate);
  if (Number.isNaN(d.getTime())) return null;
  d.setMonth(d.getMonth() + months);
  return d;
};

export const daysUntil = (expiresAt) => {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

export const relativeExpiration = (days) => {
  if (days === null || days === undefined) return '';
  if (days < 0) return `Vencido hace ${Math.abs(days)} día${Math.abs(days) === 1 ? '' : 's'}`;
  if (days === 0) return 'Vence hoy';
  if (days === 1) return 'Vence mañana';
  return `Vence en ${days} días`;
};

export const statusColor = (status) => {
  switch (status) {
    case 'vigente':
      return 'var(--accent-green, #4ade80)';
    case 'por_vencer':
      return 'var(--accent-yellow, #fbbf24)';
    case 'vencido':
      return 'var(--accent-red, #f43f5e)';
    default:
      return 'var(--text-muted, #888)';
  }
};