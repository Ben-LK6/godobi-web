// src/utils/constants.js

// URL de l'API (on changera plus tard)
export const API_URL = 'http://localhost:8000/api';

// Styles d'images disponibles
export const IMAGE_STYLES = [
  { id: 'comic', name: 'Bande dessinée', icon: '📚' },
  { id: 'realistic', name: 'Réaliste', icon: '📷' },
  { id: 'cartoon', name: 'Cartoon', icon: '🎨' },
  { id: 'manga', name: 'Manga', icon: '🎌' },
  { id: 'pixel', name: 'Pixel Art', icon: '👾' },
  { id: 'watercolor', name: 'Aquarelle', icon: '🖌️' }
];

// Taille max des fichiers (10 MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Types de fichiers acceptés
export const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

// Messages d'erreur
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'Le fichier est trop grand (max 10 MB)',
  INVALID_FILE_TYPE: 'Type de fichier non accepté (JPG, PNG uniquement)',
  NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
  UNAUTHORIZED: 'Vous devez être connecté pour effectuer cette action.',
};