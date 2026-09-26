// api/tokenStore.js
const KEY = 'token';

export const tokenStore = {
  get: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(KEY);
  },
  set: (t) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEY, t);
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEY);
  },
};