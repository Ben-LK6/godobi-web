// src/services/friendService.js
import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8000/api';

const friendService = {
  // Récupérer la liste des amis
  async getFriends() {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/friends`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  },

  // Récupérer les demandes reçues
  async getPendingRequests() {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/friends/requests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  },

  // Récupérer les demandes envoyées
  async getSentRequests() {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/friends/sent`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  },

  // Rechercher des utilisateurs
  async searchUsers(searchTerm) {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/friends/search`,
      { search: searchTerm },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  // Envoyer une demande d'ami
  async sendRequest(userId) {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/friends/send/${userId}`,
      {},
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Accepter une demande
  async acceptRequest(userId) {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/friends/accept/${userId}`,
      {},
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Refuser une demande
  async rejectRequest(userId) {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/friends/reject/${userId}`,
      {},
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Retirer un ami
  async removeFriend(userId) {
    const token = authService.getToken();
    const response = await axios.delete(
      `${API_URL}/friends/remove/${userId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data;
  }
};

export default friendService;