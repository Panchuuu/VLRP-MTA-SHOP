import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

export function useCheckoutGate() {
  const { isAuthenticated } = useAuthStore();
  const [showDiscordModal, setShowDiscordModal] = useState(false);
  const [discordInvite, setDiscordInvite] = useState('');
  const [checking, setChecking] = useState(false);

  // Retorna true si el usuario puede proceder al checkout.
  const check = async () => {
    if (!isAuthenticated()) {
      window.location.href = import.meta.env.VITE_DISCORD_LOGIN_URL;
      return false;
    }

    setChecking(true);
    try {
      const { data } = await api.get('/user/discord-check');
      if (!data.in_server) {
        setDiscordInvite(data.invite_url);
        setShowDiscordModal(true);
        return false;
      }
      return true;
    } catch {
      return true; // Si falla el check, no bloquear.
    } finally {
      setChecking(false);
    }
  };

  return { check, checking, showDiscordModal, setShowDiscordModal, discordInvite };
}
