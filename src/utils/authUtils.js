import authService from '../services/authService';

// Vérifier et maintenir la session active
export const maintainSession = () => {
  // Vérifier toutes les 2 minutes si l'utilisateur est toujours connecté
  const checkInterval = setInterval(() => {
    if (!authService.isAuthenticated()) {
      clearInterval(checkInterval);
      window.location.href = '/login';
    }
  }, 2 * 60 * 1000);

  return checkInterval;
};

// Rafraîchir les données utilisateur depuis le localStorage
export const refreshUserData = () => {
  const user = authService.getCurrentUser();
  if (user) {
    // Déclencher un événement personnalisé pour notifier les composants
    window.dispatchEvent(new CustomEvent('userDataRefresh', { detail: user }));
  }
  return user;
};

// Vérifier si le token va bientôt expirer (dans les 30 minutes)
export const isTokenExpiringSoon = () => {
  const token = authService.getToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    const thirtyMinutes = 30 * 60;
    
    return payload.exp && (payload.exp - now) < thirtyMinutes;
  } catch (error) {
    return true;
  }
};