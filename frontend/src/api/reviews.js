import api from './axios';

export const getReviews = (productId) =>
  api.get(`/products/${productId}/reviews`).then((r) => r.data.data);

export const canReview = (productId) =>
  api.get(`/products/${productId}/can-review`).then((r) => r.data);

export const submitReview = (productId, data) =>
  api.post(`/products/${productId}/reviews`, data).then((r) => r.data);
