import api from './axios';

export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');

// URL del backend que inicia el flujo OAuth2 de Discord.
export const discordLoginUrl =
  import.meta.env.VITE_DISCORD_LOGIN_URL ||
  'http://localhost:8000/api/auth/discord/redirect';
