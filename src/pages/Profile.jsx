// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import imageService from '../services/imageService';

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [myImages, setMyImages] = useState([]);
  const [stats, setStats] = useState({
    totalImages: 0,
    totalLikes: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // posts, about
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setFormData({
      username: currentUser.username,
      email: currentUser.email,
      bio: currentUser.bio || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    loadMyImages();
  }, [navigate]);

  const loadMyImages = async () => {
    try {
      setLoading(true);
      const response = await imageService.getMyImages();
      if (response.success) {
        const images = response.data.images;
        setMyImages(images);

        const totalLikes = images.reduce((sum, img) => sum + parseInt(img.likes_count || 0), 0);
        const totalViews = images.reduce((sum, img) => sum + parseInt(img.views_count || 0), 0);
        
        setStats({
          totalImages: images.length,
          totalLikes: totalLikes,
          totalViews: totalViews
        });
      }
    } catch (error) {
      console.error('Erreur chargement images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert('❌ Les mots de passe ne correspondent pas');
      return;
    }

    try {
      // Ici tu pourras ajouter l'appel API pour mettre à jour le profil
      alert('✅ Profil mis à jour ! (Fonctionnalité à implémenter côté backend)');
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      alert('❌ Erreur lors de la mise à jour');
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
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header Profil */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-5xl shadow-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            {/* Infos */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-800">{user.username}</h1>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
                >
                  {isEditing ? 'Annuler' : 'Modifier le profil'}
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 justify-center md:justify-start mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{stats.totalImages}</p>
                  <p className="text-sm text-gray-600">Publications</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{stats.totalLikes}</p>
                  <p className="text-sm text-gray-600">Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{stats.totalViews}</p>
                  <p className="text-sm text-gray-600">Vues</p>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <p className="text-gray-700">{user.bio || 'Aucune bio pour le moment'}</p>
                <p className="text-gray-500 text-sm">📧 {user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire d'édition */}
        {isEditing && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Modifier le profil</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Parle-nous de toi..."
                />
              </div>

              <div className="border-t pt-4 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Changer le mot de passe</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors"
              >
                Enregistrer les modifications
              </button>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('posts')}
                className={`flex-1 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'posts'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📰 Publications
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`flex-1 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'about'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                ℹ️ À propos
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'posts' ? (
              loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : myImages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    Aucune publication
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Crée ta première image !
                  </p>
                  <Link
                    to="/create"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Créer maintenant
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {myImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative aspect-square bg-gray-200 rounded overflow-hidden group cursor-pointer"
                    >
                      <img
                        src={image.generated_image}
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="text-white text-center">
                          <div className="flex gap-4 justify-center">
                            <span className="flex items-center gap-1">
                              <svg className="w-5 h-5" fill="white" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                              {image.likes_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-5 h-5" fill="none" stroke="white" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {image.views_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Nom d'utilisateur</h3>
                  <p className="text-gray-600">{user.username}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Email</h3>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Bio</h3>
                  <p className="text-gray-600">{user.bio || 'Aucune bio'}</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Membre depuis</h3>
                  <p className="text-gray-600">{new Date(user.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;