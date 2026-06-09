import api from './axios';

export const getNotifications = () =>
  api.get('/notifications').then((r) => r.data);
export const markAllRead = () => api.post('/notifications/read').then((r) => r.data);
export const markRead = (id) => api.post(`/notifications/${id}/read`).then((r) => r.data);
