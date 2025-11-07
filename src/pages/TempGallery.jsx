// src/pages/TempGallery.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function TempGallery() {
  const [savedImages, setSavedImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { id: 'all', name: 'Tout', emoji: '📱', count: savedImages.length },
    { id: 'ai', name: 'IA', emoji: '✨', count: savedImages.filter(img => img.type === 'ai').length },
    { id: 'camera', name: 'Caméra', emoji: '📷', count: savedImages.filter(img => img.type.includes('camera')).length },
    { id: 'upload', name: 'Import', emoji: '🖼️', count: savedImages.filter(img => img.type.includes('upload')).length }
  ];

  useEffect(() => {
    // Charger les images sauvegardées depuis localStorage
    const saved = localStorage.getItem('godobi_temp_gallery');
    if (saved) {
      setSavedImages(JSON.parse(saved));
    }
  }, []);

  const filteredImages = selectedCategory === 'all' 
    ? savedImages 
    : savedImages.filter(img => {
        if (selectedCategory === 'camera') return img.type.includes('camera');
        if (selectedCategory === 'upload') return img.type.includes('upload');
        return img.type === selectedCategory;
      });

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const handleEdit = () => {
    if (selectedImage) {
      navigate('/image-editor', { state: { imageUrl: selectedImage.url } });
    }
  };

  const handlePost = () => {
    if (selectedImage) {
      // TODO: Poster sur le feed
      alert('🚀 Posté sur le feed !');
      handleCloseModal();
    }
  };

  const handleDelete = () => {
    if (selectedImage) {
      const updatedImages = savedImages.filter(img => img.id !== selectedImage.id);
      setSavedImages(updatedImages);
      localStorage.setItem('godobi_temp_gallery', JSON.stringify(updatedImages));
      handleCloseModal();
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-4 pt-12">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/create')}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h1 className="text-white font-bold text-lg">Galerie Temporaire</h1>
          
          <div className="w-10"></div>
        </div>

        {/* Catégories */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-full transition-all text-xs sm:text-sm ${
                selectedCategory === category.id
                  ? 'bg-white text-purple-900 font-semibold'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <span className="mr-1 sm:mr-2">{category.emoji}</span>
              <span className="hidden sm:inline">{category.name} </span>
              <span className="sm:hidden">{category.emoji === '📱' ? 'Tout' : category.name} </span>
              ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Grille d'images */}
      <div className="p-3 sm:p-4 pb-24">
        {filteredImages.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📱</div>
            <h3 className="text-white font-semibold text-base sm:text-lg mb-2">Aucune image sauvée</h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 px-4">Commence par créer et sauvegarder des images</p>
            <button
              onClick={() => navigate('/create')}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base"
            >
              ✨ Créer maintenant
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {filteredImages.map((image) => (
              <button
                key={image.id}
                onClick={() => handleImageSelect(image)}
                className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <img 
                  src={image.url} 
                  alt="Création" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-black/70 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs">
                  {image.type === 'ai' && '✨'}
                  {image.type.includes('camera') && '📷'}
                  {image.type.includes('upload') && '🖼️'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'affichage d'image */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-3 sm:p-4 pt-10 sm:pt-12">
            <div className="flex items-center justify-between">
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-3 py-1">
                <span className="text-lg">
                  {selectedImage.type === 'ai' && '✨'}
                  {selectedImage.type.includes('camera') && '📷'}
                  {selectedImage.type.includes('upload') && '🖼️'}
                </span>
                <span className="text-white text-xs sm:text-sm font-medium">
                  {selectedImage.type === 'ai' && 'Généré par IA'}
                  {selectedImage.type.includes('camera') && 'Photo caméra'}
                  {selectedImage.type.includes('upload') && 'Photo importée'}
                </span>
              </div>
              
              <div className="w-8 sm:w-10"></div>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center p-4">
            <img 
              src={selectedImage.url} 
              alt="Création" 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Actions - Boutons circulaires petits */}
          <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 flex justify-center">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Éditer */}
              <button
                onClick={handleEdit}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-purple-500 transition-all active:scale-95 shadow-lg"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              {/* Poster */}
              <button
                onClick={handlePost}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-green-500 transition-all active:scale-95 shadow-lg"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>

              {/* Supprimer */}
              <button
                onClick={handleDelete}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-red-500/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-red-500 transition-all active:scale-95 shadow-lg"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Style pour cacher la scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default TempGallery;