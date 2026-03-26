
import { auth } from '@/lib/firebase';

// Appelé après login/register pour stocker le token dans un cookie
export const setSessionCookie = async () => {
  const user = auth.currentUser;
  if (!user) return;
  const token = await user.getIdToken();
  document.cookie = `session=${token}; path=/; max-age=3600; SameSite=Strict`;
};

// Appelé au logout pour supprimer le cookie
export const clearSessionCookie = () => {
  document.cookie = 'session=; path=/; max-age=0';
};