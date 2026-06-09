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

export const downloadReceipt = async (orderId) => {
  const res = await api.get(`/orders/${orderId}/receipt`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `recibo-${orderId.slice(-8)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
