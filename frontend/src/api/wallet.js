import api from './axios';

export const getWallet = () => api.get('/wallet').then((r) => r.data);
export const topupWallet = (amount) =>
  api.post('/wallet/topup', { amount }).then((r) => r.data);
