// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import imageService from '../services/imageService';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentImages, setRecentImages] = useState([]);
  const [stats, setStats] = useState({
    totalImages: 0,
    totalFriends: 0,
    totalLikes: 0,
    totalMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    loadRecentImages();
  }, [navigate]);

  const loadRecentImages = async () => {
    try {
      setLoading(true);
      const response = await imageService.getMyImages();
      
      if (response.success) {
        const images = response.data.images;
        setRecentImages(images.slice(0, 3));
        
        const totalLikes = images.reduce((sum, img) => sum + parseInt(img.likes_count || 0), 0);
        setStats({
          totalImages: images.length,
          totalFriends: 0,
          totalLikes: totalLikes,
          totalMessages: 0
        });
      }
    } catch (error) {
      console.error('Erreur chargement images:', error);
    } finally {
      setLoading(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold mb-2">
          Bienvenue {user.username} ! 👋
        </h1>
        <p className="text-xl opacity-90">
          Prêt à créer quelque chose d'incroyable aujourd'hui ?
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase">Créations</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalImages}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase">Amis</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalFriends}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase">Likes reçus</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalLikes}</p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">❤️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase">Messages</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalMessages}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-2xl p-8 shadow-md mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/editor"
            className="flex items-center gap-4 p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <span className="text-4xl">✨</span>
            <div>
              <h3 className="font-bold text-lg">Créer une image</h3>
              <p className="text-sm opacity-90">Génère et personnalise</p>
            </div>
          </Link>

          <Link
            to="/friends"
            className="flex items-center gap-4 p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <span className="text-4xl">👥</span>
            <div>
              <h3 className="font-bold text-lg">Ajouter des amis</h3>
              <p className="text-sm opacity-90">Connecte-toi</p>
            </div>
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-4 p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <span className="text-4xl">⚙️</span>
            <div>
              <h3 className="font-bold text-lg">Mon profil</h3>
              <p className="text-sm opacity-90">Personnalise</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Créations récentes */}
      <div className="bg-white rounded-2xl p-8 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Mes créations récentes
          </h2>
          <Link to="/gallery" className="text-blue-600 hover:text-blue-700 font-semibold">
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : recentImages.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Aucune création pour le moment
            </h3>
            <p className="text-gray-500 mb-6">
              Commence par créer ta première image stylisée !
            </p>
            <Link
              to="/editor"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-lg"
            >
              Créer ma première image
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentImages.map((image) => (
              <div
                key={image.id}
                className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="relative aspect-video bg-gray-200">
                  <img
                    src={image.generated_image}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2 truncate">
                    {image.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>❤️ {image.likes_count}</span>
                    <span>👁️ {image.views_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;