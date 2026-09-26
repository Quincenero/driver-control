// src/api/vehicles.js
import api from './axiosConfig';

export const vehiclesApi = {
  list: () => api.get('/vehicles').then((r) => r.data.vehicles),

  active: () => api.get('/vehicles/active').then((r) => r.data.vehicle),

  get: (id) => api.get(`/vehicles/${id}`).then((r) => r.data.vehicle),

  create: (payload) =>
    api.post('/vehicles', payload).then((r) => r.data.vehicle),

  update: (id, payload) =>
    api.patch(`/vehicles/${id}`, payload).then((r) => r.data.vehicle),

  remove: (id) =>
    api.delete(`/vehicles/${id}`).then((r) => r.data.vehicle),
};