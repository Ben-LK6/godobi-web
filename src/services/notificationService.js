// src/services/notificationService.js
import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8000/api';

const notificationService = {
  // Récupérer les notifications
  async getNotifications() {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  },

  // Compter les non lues
  async countUnread() {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/notifications/unread`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId) {
    const token = authService.getToken();
    const response = await axios.put(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Marquer toutes comme lues
  async markAllAsRead() {
    const token = authService.getToken();
    const response = await axios.put(
      `${API_URL}/notifications/mark-all-read`,
      {},
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Supprimer une notification
  async deleteNotification(notificationId) {
    const token = authService.getToken();
    const response = await axios.delete(
      `${API_URL}/notifications/${notificationId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data;
  },

  // Supprimer toutes les lues
  async deleteAllRead() {
    const token = authService.getToken();
    const response = await axios.delete(
      `${API_URL}/notifications/delete-read`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    return response.data;
  }
};

export default notificationService;