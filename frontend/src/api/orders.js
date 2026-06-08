import api from './axios';

export const createOrder = (items, email, extra = {}) =>
  api.post('/orders', { items, email, ...extra }).then((r) => r.data);

export const getOrders = (page = 1) =>
  api.get('/orders', { params: { page } }).then((r) => r.data);

export const getOrder = (id) =>
  api.get(`/orders/${id}`).then((r) => r.data.data);

export const getOrderCodes = (id) =>
  api.get(`/orders/${id}/codes`).then((r) => r.data.data);

export const getUserCodes = () =>
  api.get('/user/codes').then((r) => r.data.data);
