import api from './axios';

// Resuelve un nombre de usuario de Discord a un miembro del servidor.
// Devuelve { found, recipient? , message? }.
export const validateGiftRecipient = (username) =>
  api.post('/gift/validate-recipient', { username }).then((r) => r.data);
