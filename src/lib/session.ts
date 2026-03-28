
import { auth } from '@/lib/firebase';

// Appelé après login/register pour stocker le token dans un cookie
export const setSessionCookie = async (user?: import('firebase/auth').User) => {
  const currentUser = user ?? auth.currentUser;
  if (!currentUser) return;
  const token = await currentUser.getIdToken();
  document.cookie = `session=${token}; path=/; max-age=3600; SameSite=Strict`;
};

export const clearSessionCookie = () => {
  document.cookie = 'session=; path=/; max-age=0';
};