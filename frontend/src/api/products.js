import api from './axios';

export const getCategories = () =>
  api.get('/categories').then((r) => r.data.data);

export const getProducts = (params = {}) =>
  api.get('/products', { params }).then((r) => r.data);

export const getProduct = (slug) =>
  api.get(`/products/${slug}`).then((r) => r.data.data);

export const getVipComparison = () =>
  api.get('/vip-comparison').then((r) => r.data);
