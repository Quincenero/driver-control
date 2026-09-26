
export const formatCurrency = (n, locale = 'es-AR', currency = 'ARS') => {
  const value = Number.isFinite(Number(n)) ? Number(n) : 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (n) =>
  new Intl.NumberFormat('es-AR').format(Number.isFinite(Number(n)) ? Number(n) : 0);