// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const authService = {
  // Inscription
  async register(userData) {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  },

  // Connexion
  async login(credentials) {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    
    if (response.data.success) {
      // Sauvegarder le token et les infos utilisateur
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },

  // Déconnexion
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return localStorage.getItem('token') !== null;
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Récupérer le token JWT
  getToken() {
    return localStorage.getItem('token');
  },

  // Mettre à jour les infos utilisateur
  async updateProfile(userData) {
    const token = this.getToken();
    const response = await axios.put(
      `${API_URL}/auth/profile`,
      userData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response.data.success) {
      // Mettre à jour les infos locales
      const currentUser = this.getCurrentUser();
      const updatedUser = { ...currentUser, ...response.data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    return response.data;
  }
};

export default authService;