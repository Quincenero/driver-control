// src/api/documents.js
import api from './axiosConfig';

export const documentsApi = {
  getTypes: () =>
    api.get('/documents/types').then((r) => r.data.types),

  list: () =>
    api.get('/documents').then((r) => r.data.documents),

  alerts: () =>
    api.get('/documents/alerts').then((r) => r.data.alerts),

  history: ({ type, vehicle }) =>
    api
      .get('/documents/history', { params: { type, vehicle } })
      .then((r) => r.data.history),

  create: (payload) =>
    api.post('/documents', payload).then((r) => r.data.document),

  update: (id, payload) =>
    api.patch(`/documents/${id}`, payload).then((r) => r.data.document),

  renew: (id, payload) =>
    api.post(`/documents/${id}/renew`, payload).then((r) => r.data.document),

  acknowledge: (id) =>
    api.post(`/documents/${id}/acknowledge`).then((r) => r.data.document),

  archive: (id) =>
    api.delete(`/documents/${id}`).then((r) => r.data.document),
};