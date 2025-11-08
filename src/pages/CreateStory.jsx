import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { storyService } from '../services/storyService';

function CreateStory() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('media', selectedFile);

      console.log('Envoi de la story...', selectedFile.name);
      const result = await storyService.createStory(formData);
      console.log('Résultat:', result);
      
      if (result.success) {
        navigate('/stories');
      } else {
        alert('Erreur: ' + (result.message || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur lors de la création de la story:', error);
      alert('Erreur lors de la création de la story: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <button onClick={() => navigate('/stories')} className="text-xl">×</button>
        <h1 className="font-semibold">Nouvelle Story</h1>
        <button 
          onClick={handleSubmit}
          disabled={!selectedFile || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? 'Publication...' : 'Publier'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {preview ? (
          <div className="relative max-w-md w-full">
            {selectedFile.type.startsWith('image/') ? (
              <img src={preview} alt="Preview" className="w-full rounded-lg" />
            ) : (
              <video src={preview} className="w-full rounded-lg" controls />
            )}
            <button 
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
              }}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-gray-400 text-4xl">📷</span>
            </div>
            <p className="text-gray-400 mb-4">Sélectionne une photo ou vidéo</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Choisir un fichier
            </button>
          </div>
        )}
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Bottom Actions */}
      {!preview && (
        <div className="p-4 flex justify-center gap-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-800 text-white p-4 rounded-full"
          >
            📁
          </button>
          <button className="bg-gray-800 text-white p-4 rounded-full">
            📷
          </button>
        </div>
      )}
    </div>
  );
}

export default CreateStory;