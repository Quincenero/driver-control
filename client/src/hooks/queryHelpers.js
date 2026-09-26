export const messageFor = (err, fallback = 'Error de red') => {
  const status = err?.response?.status;
  if (status === 401) return 'Sesión expirada';
  return err?.response?.data?.message || err?.message || fallback;
};

export const sumValues = (arr) =>
  (Array.isArray(arr) ? arr : []).reduce(
    (s, item) => s + (Number(item?.value ?? item?.total) || 0),
    0
  );