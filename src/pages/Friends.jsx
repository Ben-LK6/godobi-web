// src/pages/Friends.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import friendService from '../services/friendService';

function Friends() {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('friends'); // friends, requests, sent, search
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    loadAllData();
  }, [navigate]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadFriends(),
        loadPendingRequests(),
        loadSentRequests()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      const response = await friendService.getFriends();
      if (response.success) {
        setFriends(response.data.friends);
      }
    } catch (error) {
      console.error('Erreur chargement amis:', error);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const response = await friendService.getPendingRequests();
      if (response.success) {
        setPendingRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
    }
  };

  const loadSentRequests = async () => {
    try {
      const response = await friendService.getSentRequests();
      if (response.success) {
        setSentRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Erreur chargement demandes envoyées:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await friendService.searchUsers(searchQuery);
      if (response.success) {
        setSearchResults(response.data.users);
        setActiveTab('search');
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await friendService.sendRequest(userId);
      alert('✅ Demande envoyée !');
      loadSentRequests();
    } catch (error) {
      console.error('Erreur envoi demande:', error);
      alert('❌ Erreur lors de l\'envoi');
    }
  };

  const handleAccept = async (userId) => {
    try {
      await friendService.acceptRequest(userId);
      alert('✅ Ami ajouté !');
      loadAllData();
    } catch (error) {
      console.error('Erreur acceptation:', error);
      alert('❌ Erreur lors de l\'acceptation');
    }
  };

  const handleReject = async (userId) => {
    try {
      await friendService.rejectRequest(userId);
      alert('✅ Demande refusée');
      loadPendingRequests();
    } catch (error) {
      console.error('Erreur refus:', error);
      alert('❌ Erreur lors du refus');
    }
  };

  const handleCancelRequest = async (userId) => {
    try {
      await friendService.cancelRequest(userId);
      alert('✅ Demande annulée');
      loadSentRequests();
    } catch (error) {
      console.error('Erreur annulation:', error);
      alert('❌ Erreur lors de l\'annulation');
    }
  };

  const handleRemove = async (userId, username) => {
    if (!window.confirm(`Retirer ${username} de tes amis ?`)) return;

    try {
      await friendService.removeFriend(userId);
      alert('✅ Ami retiré');
      loadFriends();
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('❌ Erreur lors de la suppression');
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Amis</h1>
          
          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher des utilisateurs..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              🔍 Chercher
            </button>
          </form>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-4 text-center font-semibold transition-colors relative ${
                activeTab === 'friends'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              👥 Mes amis ({friends.length})
              {activeTab === 'friends' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-4 text-center font-semibold transition-colors relative ${
                activeTab === 'requests'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📥 Demandes reçues ({pendingRequests.length})
              {pendingRequests.length > 0 && (
                <span className="absolute top-2 right-4 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
              {activeTab === 'requests' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 py-4 text-center font-semibold transition-colors relative ${
                activeTab === 'sent'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📤 Demandes envoyées ({sentRequests.length})
              {activeTab === 'sent' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
              )}
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div>
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          ) : (
            <>
              {/* Mes amis */}
              {activeTab === 'friends' && (
                friends.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      Aucun ami pour le moment
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Commence par rechercher des utilisateurs !
                    </p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                    >
                      Chercher des amis
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {friends.map((friend) => (
                      <div key={friend.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <Link to={`/user/${friend.id}`}>
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl cursor-pointer hover:scale-110 transition-transform">
                                {friend.username.charAt(0).toUpperCase()}
                              </div>
                            </Link>
                            <Link to={`/user/${friend.id}`} className="flex-1 hover:text-blue-600 transition-colors">
                              <h3 className="font-bold text-gray-800 text-lg">{friend.username}</h3>
                              <p className="text-sm text-gray-500 truncate">{friend.email}</p>
                            </Link>
                          </div>
                          
                          <div className="flex gap-2">
                            <Link
                              to={`/messages?contact=${friend.id}`}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-center"
                            >
                              💬 Message
                            </Link>
                            <button
                              onClick={() => handleRemove(friend.id, friend.username)}
                              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-semibold transition-colors"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Demandes reçues */}
              {activeTab === 'requests' && (
                pendingRequests.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📥</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      Aucune demande reçue
                    </h3>
                    <p className="text-gray-500">
                      Les nouvelles demandes d'amitié apparaîtront ici
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border-2 border-blue-200">
                        <div className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                              {request.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800 text-lg">{request.username}</h3>
                              <p className="text-sm text-gray-500 truncate">{request.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAccept(request.id)}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                            >
                              ✓ Accepter
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
                            >
                              ✕ Refuser
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Demandes envoyées */}
              {activeTab === 'sent' && (
                sentRequests.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">📤</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      Aucune demande envoyée
                    </h3>
                    <p className="text-gray-500">
                      Les demandes que tu envoies apparaîtront ici
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sentRequests.map((request) => (
                      <div key={request.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                              {request.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800 text-lg">{request.username}</h3>
                              <p className="text-sm text-yellow-600 font-semibold">⏳ En attente</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleCancelRequest(request.id)}
                            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
                          >
                            Annuler la demande
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Résultats de recherche */}
              {activeTab === 'search' && (
                searchResults.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                      Aucun résultat
                    </h3>
                    <p className="text-gray-500">
                      Essaie un autre nom d'utilisateur
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((result) => (
                      <div key={result.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                              {result.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800 text-lg">{result.username}</h3>
                              <p className="text-sm text-gray-500 truncate">{result.email}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleSendRequest(result.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                          >
                            ➕ Ajouter en ami
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Friends;