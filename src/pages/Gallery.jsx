// src/pages/Gallery.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import imageService from '../services/imageService';
import MobileHeader from '../components/MobileHeader';
import MobileNav from '../components/MobileNav';

function Gallery() {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, public, private
  const [sortBy, setSortBy] = useState('recent'); // recent, popular, views
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  const loadImages = async () => {
    try {
      setLoading(true);
      const response = await imageService.getMyImages();
      console.log('Response getMyImages:', response);
      
      if (response.success && response.data) {
        const images = response.data.images || response.data || [];
        setImages(images);
      } else {
        console.error('Erreur API:', response.message);
        setImages([]);
      }
    } catch (error) {
      console.error('Erreur chargement images:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...images];

    // Filtre par visibilité (nouveau schéma utilise is_private)
    if (filter === 'public') {
      filtered = filtered.filter(img => !img.is_private);
    } else if (filter === 'private') {
      filtered = filtered.filter(img => img.is_private);
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
  }, [images, filter, sortBy]);

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
  }, [applyFilters]);

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

  const toggleVisibility = async (imageId, currentPrivate) => {
    try {
      const newPrivate = !currentPrivate;
      // TODO: Implémenter updateVisibility dans imageService
      // await imageService.updateVisibility(imageId, newPrivate);
      
      setImages(images.map(img => 
        img.id === imageId ? { ...img, is_private: newPrivate } : img
      ));
      
      alert(newPrivate ? '✅ Image privée' : '✅ Image publique');
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
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <MobileHeader title="🖼️ Galerie" />
      
      <div className="max-w-4xl mx-auto px-2 py-3">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">🖼️ Ma Galerie</h1>
              <p className="text-xs text-gray-500">
                {filteredImages.length} création{filteredImages.length > 1 ? 's' : ''}
              </p>
            </div>
            <Link
              to="/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium text-sm transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Créer
            </Link>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('public')}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === 'public'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🌍 Publiques
            </button>
            <button
              onClick={() => setFilter('private')}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === 'private'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔒 Privées
            </button>
            <div className="w-px bg-gray-200 mx-1"></div>
            <button
              onClick={() => setSortBy('recent')}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                sortBy === 'recent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📅 Récent
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                sortBy === 'popular'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ❤️ Populaire
            </button>
            <button
              onClick={() => setSortBy('views')}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                sortBy === 'views'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              👁️ Vues
            </button>
          </div>
        </div>

        {/* Galerie */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-gray-600 text-sm">Chargement...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Aucune création
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {filter === 'public' && 'Pas encore de créations publiques'}
              {filter === 'private' && 'Pas encore de créations privées'}
              {filter === 'all' && 'Commence par créer ta première image !'}
            </p>
            <Link
              to="/create"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
            >
              Créer maintenant
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                {/* Image */}
                <div
                  className="relative aspect-square bg-gray-200 cursor-pointer group"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.generated_image}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  {/* Badge visibilité */}
                  <div className="absolute top-1 right-1">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      !image.is_private
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-800 text-white'
                    }`}>
                      {!image.is_private ? '🌍' : '🔒'}
                    </span>
                  </div>
                </div>

                {/* Infos */}
                <div className="p-2">
                  <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                    {image.title}
                  </h3>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <div className="flex items-center gap-2">
                      <span>❤️ {image.likes_count || 0}</span>
                      <span>👁️ {image.views_count || 0}</span>
                    </div>
                    <span>💬 {image.comments_count || 0}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleVisibility(image.id, image.is_private)}
                      className="flex-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition-colors"
                    >
                      {!image.is_private ? '🔒' : '🌍'}
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded text-xs font-medium transition-colors"
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
      
      <MobileNav />

      {/* Modal Image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-8 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage.generated_image}
              alt={selectedImage.title}
              className="w-full rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-3 text-white text-center">
              <h3 className="text-lg font-semibold">{selectedImage.title}</h3>
              {selectedImage.description && (
                <p className="mt-1 text-gray-300 text-sm">{selectedImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gallery;