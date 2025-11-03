// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import authService from '../services/authService';
import friendService from '../services/friendService';
import imageService from '../services/imageService';

function UserProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [userImages, setUserImages] = useState([]);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    if (parseInt(userId) === user.id) {
      navigate('/profile');
      return;
    }

    loadUserProfile();
  }, [userId, navigate]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      const friendsResponse = await friendService.getFriends();
      
      let user = null;
      if (friendsResponse.success) {
        user = friendsResponse.data.friends.find(f => f.id === parseInt(userId));
      }
      
      if (!user) {
        const requestsResponse = await friendService.getPendingRequests();
        if (requestsResponse.success) {
          user = requestsResponse.data.requests.find(r => r.id === parseInt(userId));
        }
      }
      
      if (!user) {
        const sentResponse = await friendService.getSentRequests();
        if (sentResponse.success) {
          user = sentResponse.data.requests.find(r => r.id === parseInt(userId));
        }
      }

      if (user) {
        setProfileUser(user);
        await loadUserImages();
        checkFriendshipStatus();
      } else {
        alert('❌ Utilisateur non trouvé');
        navigate('/friends');
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserImages = async () => {
    try {
      const response = await imageService.getPublicImages();
      if (response.success) {
        const userPublicImages = response.data.images.filter(
          img => img.user_id === parseInt(userId)
        );
        setUserImages(userPublicImages);
      }
    } catch (error) {
      console.error('Erreur chargement images:', error);
    }
  };

  const checkFriendshipStatus = async () => {
    try {
      const friendsResponse = await friendService.getFriends();
      if (friendsResponse.success) {
        const isFriend = friendsResponse.data.friends.some(f => f.id === parseInt(userId));
        if (isFriend) {
          setFriendshipStatus('friends');
          return;
        }
      }

      const requestsResponse = await friendService.getPendingRequests();
      if (requestsResponse.success) {
        const hasRequest = requestsResponse.data.requests.some(r => r.id === parseInt(userId));
        if (hasRequest) {
          setFriendshipStatus('request_received');
          return;
        }
      }

      const sentResponse = await friendService.getSentRequests();
      if (sentResponse.success) {
        const hasSent = sentResponse.data.requests.some(r => r.id === parseInt(userId));
        if (hasSent) {
          setFriendshipStatus('request_sent');
          return;
        }
      }

      setFriendshipStatus('none');
    } catch (error) {
      console.error('Erreur vérification statut:', error);
    }
  };

  const handleSendRequest = async () => {
    try {
      await friendService.sendRequest(parseInt(userId));
      alert('✅ Demande d\'ami envoyée !');
      setFriendshipStatus('request_sent');
    } catch (error) {
      console.error('Erreur envoi demande:', error);
      alert('❌ Erreur lors de l\'envoi');
    }
  };

  const handleAcceptRequest = async () => {
    try {
      await friendService.acceptRequest(parseInt(userId));
      alert('✅ Ami ajouté !');
      setFriendshipStatus('friends');
    } catch (error) {
      console.error('Erreur acceptation:', error);
      alert('❌ Erreur lors de l\'acceptation');
    }
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm('Retirer cet ami ?')) return;

    try {
      await friendService.removeFriend(parseInt(userId));
      alert('✅ Ami retiré');
      navigate('/friends');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  if (!currentUser || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Utilisateur non trouvé</div>
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
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-5xl shadow-lg flex-shrink-0">
              {profileUser.username.charAt(0).toUpperCase()}
            </div>

            {/* Infos */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-800">{profileUser.username}</h1>
              </div>

              {/* Stats */}
              <div className="flex gap-8 justify-center md:justify-start mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">{userImages.length}</p>
                  <p className="text-sm text-gray-600">Publications</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">
                    {userImages.reduce((sum, img) => sum + parseInt(img.likes_count || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800">
                    {userImages.reduce((sum, img) => sum + parseInt(img.views_count || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Vues</p>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1 mb-4">
                <p className="text-gray-700">{profileUser.bio || 'Aucune bio'}</p>
                <p className="text-gray-500 text-sm">📧 {profileUser.email}</p>
              </div>

              {/* Actions selon le statut */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {friendshipStatus === 'friends' && (
                  <>
                    <Link
                      to={`/messages?contact=${userId}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Envoyer un message
                    </Link>
                    <button
                      onClick={handleRemoveFriend}
                      className="text-red-500 hover:text-red-700 px-6 py-2 rounded-lg hover:bg-red-50 transition-colors font-semibold border border-red-300"
                    >
                      Retirer des amis
                    </button>
                  </>
                )}

                {friendshipStatus === 'request_received' && (
                  <button
                    onClick={handleAcceptRequest}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    ✓ Accepter la demande
                  </button>
                )}

                {friendshipStatus === 'request_sent' && (
                  <span className="bg-yellow-100 text-yellow-700 font-semibold px-6 py-2 rounded-lg border border-yellow-300">
                    ⏳ Demande en attente
                  </span>
                )}

                {friendshipStatus === 'none' && (
                  <button
                    onClick={handleSendRequest}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    ➕ Ajouter en ami
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Créations publiques */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Créations publiques ({userImages.length})
          </h2>

          {userImages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-gray-600">Aucune création publique</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {userImages.map((image) => (
                <div
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                >
                  <img
                    src={image.generated_image}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="text-white text-center">
                      <h3 className="font-bold mb-2">{image.title}</h3>
                      <div className="flex gap-4 justify-center text-sm">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="white" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          {image.likes_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
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
          )}
        </div>
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
              <div className="flex gap-6 justify-center mt-4">
                <span>❤️ {selectedImage.likes_count} likes</span>
                <span>👁️ {selectedImage.views_count} vues</span>
                <span>💬 {selectedImage.comments_count || 0} commentaires</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;