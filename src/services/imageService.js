// src/services/imageService.js
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ImageService {
  // Créer une nouvelle image
  async createImage(imageData) {
    try {
      const token = authService.getToken();
      
      if (!token) {
        return { success: false, message: 'Non connecté' };
      }

      const response = await fetch(`${API_URL}/api/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(imageData)
      });

      // Vérifier si la réponse est vide
      const responseText = await response.text();
      
      if (!responseText) {
        console.error('Réponse vide du serveur');
        return { success: false, message: 'Erreur serveur - réponse vide' };
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Erreur parsing JSON:', parseError, 'Réponse:', responseText);
        return { success: false, message: 'Erreur format réponse serveur' };
      }
      
      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || 'Erreur inconnue' };
      }
    } catch (error) {
      console.error('Erreur création image:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  // Récupérer mes images
  async getMyImages() {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/images`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erreur récupération images:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  // Récupérer les images publiques (feed)
  async getPublicImages() {
    try {
      const token = authService.getToken();
      const headers = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_URL}/api/images/public`, {
        method: 'GET',
        headers
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erreur récupération feed:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  // Vérifier si l'utilisateur a liké une image
  async checkLike(imageId) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/likes/${imageId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erreur vérification like:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  // Toggle like sur une image
  async toggleLike(imageId) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/likes/${imageId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erreur toggle like:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  // Récupérer les commentaires d'une image
  async getComments(imageId) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/comments/image/${imageId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erreur récupération commentaires:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  // Ajouter un commentaire
  async addComment(imageId, commentText) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/comments/image/${imageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment_text: commentText })
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  // Supprimer un commentaire
  async deleteComment(commentId) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erreur suppression commentaire:', error);
      return { success: false, message: 'Erreur de connexion' };
    }
  }

  // Convertir image en base64
  async imageToBase64(imageUrl) {
    try {
      // Si c'est déjà une URL base64, la retourner directement
      if (imageUrl.startsWith('data:')) {
        return imageUrl;
      }
      
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Erreur conversion base64:', error);
      return null;
    }
  }
}

export default new ImageService();