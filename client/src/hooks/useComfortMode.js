// hooks/useComfortMode.js
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'comfort-mode';

export function useComfortMode() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === '1';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('comfort-mode', enabled);
    if (enabled) {
      localStorage.setItem(STORAGE_KEY, '1');
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [enabled]);

  const toggle = useCallback(() => setEnabled((v) => !v), []);

  return { enabled, toggle };
}