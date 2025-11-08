const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const storyService = {
  // Récupérer toutes les stories des amis
  async getAllStories() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/stories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des stories');
    }

    const data = await response.json();
    return data.stories || [];
  },

  // Récupérer mes stories
  async getMyStories() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/stories/my`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de mes stories');
    }

    const data = await response.json();
    return data.stories || [];
  },

  // Créer une nouvelle story
  async createStory(formData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/stories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création de la story');
    }

    return await response.json();
  },

  // Supprimer une story
  async deleteStory(storyId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/stories/${storyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la story');
    }

    return await response.json();
  },

  // Marquer une story comme vue
  async markAsViewed(storyId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/stories/${storyId}/view`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors du marquage de la story');
    }

    return await response.json();
  }
};