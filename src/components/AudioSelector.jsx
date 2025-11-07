// src/components/AudioSelector.jsx
import React, { useState, useEffect } from 'react';
import audioService from '../services/audioService';

function AudioSelector({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedMusic,
  musicLibrary = [] 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [userAudios, setUserAudios] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('library'); // 'library' ou 'uploads'

  useEffect(() => {
    if (isOpen) {
      loadUserAudios();
    }
    
    return () => {
      audioService.stopPreview();
      setIsPlaying(false);
      setCurrentPreview(null);
    };
  }, [isOpen]);

  // Charger les audios de l'utilisateur
  const loadUserAudios = async () => {
    try {
      // TODO: Implémenter la récupération depuis l'API
      // const token = authService.getToken();
      // const audios = await audioService.getMyAudios(token);
      // setUserAudios(audios);
    } catch (error) {
      console.error('Erreur chargement audios:', error);
    }
  };

  // Preview audio
  const handlePreview = async (music, event) => {
    event.stopPropagation();
    
    try {
      // Arrêter la preview actuelle
      audioService.stopPreview();
      setIsPlaying(false);
      setCurrentPreview(null);
      
      // Démarrer nouvelle preview
      if (currentPreview?.id !== music.id) {
        await audioService.playPreview(music.url, music.duration);
        setIsPlaying(true);
        setCurrentPreview(music);
        
        // Arrêter automatiquement après 30s
        setTimeout(() => {
          setIsPlaying(false);
          setCurrentPreview(null);
        }, 30000);
      }
    } catch (error) {
      console.error('Erreur preview:', error);
    }
  };

  // Upload audio personnalisé
  const handleUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*,.mp3,.wav,.ogg,.m4a,.aac';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setIsUploading(true);
        try {
          const audioObject = await audioService.createAudioObject(file);
          onSelect(audioObject);
          onClose();
        } catch (error) {
          alert(`❌ ${error.message}`);
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  };

  // Sélectionner une musique
  const handleSelect = (music) => {
    audioService.stopPreview();
    setIsPlaying(false);
    setCurrentPreview(null);
    onSelect(music);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Ajouter une musique</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'library'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Bibliothèque
            </button>
            <button
              onClick={() => setActiveTab('uploads')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'uploads'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mes audios
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="max-h-96 overflow-y-auto">
          {activeTab === 'library' && (
            <div className="p-4">
              {/* Bouton Upload */}
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-300 text-sm hover:bg-blue-500/30 transition-all flex items-center gap-3 mb-4"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin"></div>
                    <span>Upload en cours...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Importer ma musique</span>
                  </>
                )}
              </button>

              {/* Bibliothèque */}
              <div className="space-y-2">
                <p className="text-xs text-gray-400 mb-2">Musiques libres de droits</p>
                {musicLibrary.map((music) => (
                  <button
                    key={music.id}
                    onClick={() => handleSelect(music)}
                    className={`w-full p-3 rounded-lg text-left transition-all hover:bg-white/5 ${
                      selectedMusic?.id === music.id ? 'bg-green-500/20 border border-green-400/30' : 'border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{music.name}</p>
                        <p className="text-gray-400 text-xs truncate">{music.artist}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <span className="text-xs text-gray-400">{audioService.formatDuration(music.duration)}</span>
                        
                        {/* Bouton Preview */}
                        <button
                          onClick={(e) => handlePreview(music, e)}
                          className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
                        >
                          {isPlaying && currentPreview?.id === music.id ? (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )}
                        </button>
                        
                        {selectedMusic?.id === music.id && (
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'uploads' && (
            <div className="p-4">
              {userAudios.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Aucun audio uploadé</p>
                  <button
                    onClick={handleUpload}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                  >
                    Importer un fichier
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {userAudios.map((audio) => (
                    <button
                      key={audio.filename}
                      onClick={() => handleSelect(audio)}
                      className="w-full p-3 rounded-lg text-left transition-all hover:bg-white/5 border border-transparent hover:border-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{audio.name}</p>
                          <p className="text-gray-400 text-xs">
                            {audioService.formatFileSize(audio.size)} • Uploadé
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <button
                            onClick={(e) => handlePreview(audio, e)}
                            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
                          >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Musique sélectionnée */}
        {selectedMusic && (
          <div className="p-4 border-t border-gray-700 bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{selectedMusic.name}</p>
                <p className="text-green-400 text-xs">{selectedMusic.artist}</p>
              </div>
              <button
                onClick={() => onSelect(null)}
                className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-colors"
              >
                <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AudioSelector;