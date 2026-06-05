import api from './axios';

export const createOrder = (items, email) =>
  api.post('/orders', { items, email }).then((r) => r.data);

export const getOrders = (page = 1) =>
  api.get('/orders', { params: { page } }).then((r) => r.data);

export const getOrder = (id) =>
  api.get(`/orders/${id}`).then((r) => r.data.data);
