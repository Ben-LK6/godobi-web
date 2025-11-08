// src/services/audioService.js
class AudioService {
  constructor() {
    this.currentAudio = null;
    this.isPlaying = false;
  }

  // Valider un fichier audio
  validateAudioFile(file) {
    const validTypes = [
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 
      'audio/mpeg', 'audio/mp4', 'audio/x-wav', 'audio/wave'
    ];
    const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    // Vérifier le type MIME
    const hasValidType = validTypes.includes(file.type);
    
    // Vérifier l'extension comme fallback
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidType && !hasValidExtension) {
      throw new Error('Format audio non supporté. Utilisez MP3, WAV, OGG, M4A ou AAC.');
    }

    if (file.size > maxSize) {
      throw new Error('Fichier trop volumineux (max 10MB)');
    }

    if (file.size === 0) {
      throw new Error('Fichier audio vide ou corrompu');
    }

    return true;
  }

  // Obtenir les métadonnées audio
  async getAudioMetadata(file) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.onloadedmetadata = () => {
        const metadata = {
          duration: Math.round(audio.duration),
          name: file.name.replace(/\.[^/.]+$/, ""),
          size: file.size,
          type: file.type,
          url: url
        };
        resolve(metadata);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Impossible de lire le fichier audio'));
      };

      audio.src = url;
    });
  }

  // Créer un objet audio pour l'upload
  async createAudioObject(file) {
    try {
      this.validateAudioFile(file);
      const metadata = await this.getAudioMetadata(file);
      
      return {
        id: Date.now(),
        name: metadata.name,
        artist: "Ma musique",
        duration: metadata.duration,
        url: metadata.url,
        file: file,
        size: metadata.size,
        type: metadata.type,
        isCustom: true,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      throw error;
    }
  }

  // Jouer un aperçu audio
  async playPreview(audioUrl, maxDuration = 30) {
    try {
      // Arrêter l'audio actuel
      this.stopPreview();

      const audio = new Audio(audioUrl);
      audio.volume = 0.3;
      audio.currentTime = 0;

      // Limiter la durée de preview
      const previewDuration = Math.min(maxDuration, 30);
      
      return new Promise((resolve, reject) => {
        audio.ontimeupdate = () => {
          if (audio.currentTime >= previewDuration) {
            this.stopPreview();
            resolve('preview_ended');
          }
        };

        audio.onended = () => {
          this.stopPreview();
          resolve('audio_ended');
        };

        audio.onerror = () => {
          this.stopPreview();
          reject(new Error('Erreur lors de la lecture audio'));
        };

        audio.play().then(() => {
          this.currentAudio = audio;
          this.isPlaying = true;
          resolve('playing');
        }).catch(reject);
      });
    } catch (error) {
      throw error;
    }
  }

  // Arrêter la preview
  stopPreview() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isPlaying = false;
  }

  // Convertir audio en base64 (pour l'API)
  async audioToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Formater la durée en mm:ss
  formatDuration(seconds) {
    if (!seconds || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Obtenir la taille formatée
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Upload audio vers l'API
  async uploadToAPI(file, token) {
    try {
      this.validateAudioFile(file);
      
      const formData = new FormData();
      formData.append('audio', file);
      
      const response = await fetch('/api/audio/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Erreur upload');
      }
      
      return result.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Supprimer audio de l'API
  async deleteFromAPI(filename, token) {
    try {
      const response = await fetch('/api/audio/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Erreur suppression');
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }
  
  // Récupérer les audios de l'utilisateur
  async getMyAudios(token) {
    try {
      const response = await fetch('/api/audio/my-audios', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Erreur récupération');
      }
      
      return result.data.files;
    } catch (error) {
      throw error;
    }
  }

  // Nettoyer les URLs créées
  cleanup() {
    this.stopPreview();
    // Note: Les URLs blob seront nettoyées automatiquement par le garbage collector
  }
}

const audioService = new AudioService();
export default audioService;