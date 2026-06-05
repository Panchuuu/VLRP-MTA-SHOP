import api from './axios';

export const getServerStatus = () => api.get('/server-status').then((r) => r.data);
export const getLeaderboard = () => api.get('/leaderboard').then((r) => r.data.data);
export const getGallery = () => api.get('/gallery').then((r) => r.data.data);
export const getStaff = () => api.get('/staff').then((r) => r.data.data);
export const getTestimonials = () => api.get('/testimonials').then((r) => r.data.data);
export const submitTestimonial = (d) =>
  api.post('/testimonials', d).then((r) => r.data);
