// src/services/messageService.js
import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8000/api';

const messageService = {
  // Récupérer les conversations
  async getConversations() {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  },

  // Récupérer les messages d'une conversation
  async getMessages(contactId) {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/messages/conversation/${contactId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  },

  // Envoyer un message
  async sendMessage(receiverId, messageText) {
    const token = authService.getToken();
    const response = await axios.post(
      `${API_URL}/messages/send`,
      {
        receiver_id: receiverId,
        message_text: messageText
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  // Compter les messages non lus
  async countUnread() {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/messages/unread`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  },

  // Supprimer un message
  async deleteMessage(messageId) {
    const token = authService.getToken();
    const response = await axios.delete(`${API_URL}/messages/${messageId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  }
};

export default messageService;