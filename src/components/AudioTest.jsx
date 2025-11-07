// src/components/AudioTest.jsx
import React, { useState } from 'react';
import audioService from '../services/audioService';

function AudioTest() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        console.log('Fichier sélectionné:', {
          name: file.name,
          type: file.type,
          size: file.size
        });
        
        const audioObject = await audioService.createAudioObject(file);
        setSelectedFile(file);
        setAudioData(audioObject);
        console.log('Objet audio créé:', audioObject);
      } catch (error) {
        console.error('Erreur:', error);
        alert(`Erreur: ${error.message}`);
      }
    }
  };

  const handlePreview = async () => {
    if (audioData) {
      try {
        setIsPlaying(true);
        await audioService.playPreview(audioData.url, 10); // 10s max
        setTimeout(() => setIsPlaying(false), 10000);
      } catch (error) {
        console.error('Erreur preview:', error);
        setIsPlaying(false);
        alert(`Erreur preview: ${error.message}`);
      }
    }
  };

  const handleStop = () => {
    audioService.stopPreview();
    setIsPlaying(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-4">Test Audio Upload</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Sélectionner un fichier audio
          </label>
          <input
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
            onChange={handleFileSelect}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {audioData && (
          <div className="p-4 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">Informations du fichier :</h4>
            <div className="text-sm space-y-1">
              <p><strong>Nom :</strong> {audioData.name}</p>
              <p><strong>Durée :</strong> {audioService.formatDuration(audioData.duration)}</p>
              <p><strong>Taille :</strong> {audioService.formatFileSize(audioData.size)}</p>
              <p><strong>Type :</strong> {audioData.type}</p>
            </div>
            
            <div className="mt-4 space-x-2">
              <button
                onClick={handlePreview}
                disabled={isPlaying}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isPlaying ? 'Lecture...' : 'Preview (10s)'}
              </button>
              
              {isPlaying && (
                <button
                  onClick={handleStop}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Arrêter
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AudioTest;