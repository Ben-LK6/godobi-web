// src/services/imageService.js
import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8000/api';

const imageService = {
  // Créer une nouvelle image
  async createImage(imageData) {
    const token = authService.getToken();
    console.log('URL appelée:', `${API_URL}/images`);
    console.log('Token:', token);
    console.log('Data:', imageData);
    
    const response = await axios.post(
      `${API_URL}/images`,
      imageData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  // Récupérer toutes mes images
  async getMyImages() {
    const token = authService.getToken();
    const response = await axios.get(
      `${API_URL}/images`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Récupérer une image par ID
  async getImageById(id) {
    const token = authService.getToken();
    const response = await axios.get(
      `${API_URL}/images/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Supprimer une image
  async deleteImage(id) {
    const token = authService.getToken();
    const response = await axios.delete(
      `${API_URL}/images/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Récupérer les images publiques (feed)
  async getPublicImages() {
    const response = await axios.get(`${API_URL}/images/public`);
    return response.data;
  },

  // Toggle like (liker/unliker)
  async toggleLike(imageId) {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/likes/${imageId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Alias pour compatibilité (Feed.jsx utilise likeImage)
  async likeImage(imageId) {
    return this.toggleLike(imageId);
  },

  // Vérifier si une image est likée
  async checkLike(imageId) {
    const token = authService.getToken();
    const response = await axios.get(
      `${API_URL}/likes/${imageId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  // Récupérer les commentaires d'une image
  async getComments(imageId) {
    const response = await axios.get(`${API_URL}/comments/image/${imageId}`);
    return response.data;
  },

  // Ajouter un commentaire
  async addComment(imageId, commentText) {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/comments/image/${imageId}`,
      { comment_text: commentText },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  // Supprimer un commentaire
  async deleteComment(commentId) {
    const token = authService.getToken();
    const response = await axios.delete(
      `${API_URL}/comments/${commentId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
};

export default imageService;