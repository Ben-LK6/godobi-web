// src/pages/Gallery.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import imageService from '../services/imageService';

function Gallery() {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, public, private
  const [sortBy, setSortBy] = useState('recent'); // recent, popular, views
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    loadImages();
  }, [navigate]);

  useEffect(() => {
    applyFilters();
  }, [images, filter, sortBy]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await imageService.getMyImages();
      if (response.success) {
        setImages(response.data.images);
      }
    } catch (error) {
      console.error('Erreur chargement images:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...images];

    // Filtre par visibilité
    if (filter === 'public') {
      filtered = filtered.filter(img => img.is_public === 1);
    } else if (filter === 'private') {
      filtered = filtered.filter(img => img.is_public === 0);
    }

    // Tri
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    } else if (sortBy === 'views') {
      filtered.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    }

    setFilteredImages(filtered);
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Supprimer cette création ?')) return;

    try {
      await imageService.deleteImage(imageId);
      setImages(images.filter(img => img.id !== imageId));
      alert('✅ Image supprimée');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const toggleVisibility = async (imageId, currentVisibility) => {
    try {
      const newVisibility = currentVisibility === 1 ? 0 : 1;
      await imageService.updateVisibility(imageId, newVisibility);
      
      setImages(images.map(img => 
        img.id === imageId ? { ...img, is_public: newVisibility } : img
      ));
      
      alert(newVisibility === 1 ? '✅ Image publique' : '✅ Image privée');
    } catch (error) {
      console.error('Erreur changement visibilité:', error);
      alert('❌ Erreur lors du changement');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Ma Galerie</h1>
              <p className="text-gray-600">
                {filteredImages.length} création{filteredImages.length > 1 ? 's' : ''}
              </p>
            </div>
            <Link
              to="/editor"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer une image
            </Link>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filtre visibilité */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Visibilité
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Toutes
                </button>
                <button
                  onClick={() => setFilter('public')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === 'public'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🌍 Publiques
                </button>
                <button
                  onClick={() => setFilter('private')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    filter === 'private'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🔒 Privées
                </button>
              </div>
            </div>

            {/* Tri */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trier par
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('recent')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    sortBy === 'recent'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📅 Récent
                </button>
                <button
                  onClick={() => setSortBy('popular')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    sortBy === 'popular'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ❤️ Populaire
                </button>
                <button
                  onClick={() => setSortBy('views')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    sortBy === 'views'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👁️ Vues
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Galerie */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Aucune création
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'public' && 'Tu n\'as pas encore de créations publiques'}
              {filter === 'private' && 'Tu n\'as pas encore de créations privées'}
              {filter === 'all' && 'Commence par créer ta première image !'}
            </p>
            <Link
              to="/editor"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Créer maintenant
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                {/* Image */}
                <div
                  className="relative aspect-video bg-gray-200 cursor-pointer group"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.generated_image}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  {/* Badge visibilité */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      image.is_public === 1
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-800 text-white'
                    }`}>
                      {image.is_public === 1 ? '🌍 Public' : '🔒 Privé'}
                    </span>
                  </div>
                </div>

                {/* Infos */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2 truncate">
                    {image.title}
                  </h3>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      ❤️ {image.likes_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      👁️ {image.views_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {image.comments_count || 0}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleVisibility(image.id, image.is_public)}
                      className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
                    >
                      {image.is_public === 1 ? '🔒 Passer en privé' : '🌍 Publier'}
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-semibold transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage.generated_image}
              alt={selectedImage.title}
              className="w-full rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 text-white text-center">
              <h3 className="text-2xl font-bold">{selectedImage.title}</h3>
              {selectedImage.description && (
                <p className="mt-2 text-gray-300">{selectedImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;