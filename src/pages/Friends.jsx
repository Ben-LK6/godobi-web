// src/pages/Friends.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import friendService from '../services/friendService';
import MobileNav from '../components/MobileNav';

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
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <div className="max-w-3xl mx-auto px-3 py-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <h1 className="text-lg font-semibold text-gray-900 mb-3">👥 Amis</h1>
          
          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              OK
            </button>
          </form>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-3 px-2 text-center font-medium transition-all text-sm ${
                activeTab === 'friends'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-base">👥</span>
                <span className="text-xs">Amis ({friends.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-3 px-2 text-center font-medium transition-all text-sm relative ${
                activeTab === 'requests'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="relative">
                  <span className="text-base">📥</span>
                  {pendingRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {pendingRequests.length > 9 ? '9+' : pendingRequests.length}
                    </span>
                  )}
                </div>
                <span className="text-xs">Reçues ({pendingRequests.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 py-3 px-2 text-center font-medium transition-all text-sm ${
                activeTab === 'sent'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-base">📤</span>
                <span className="text-xs">Envoyées ({sentRequests.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div>
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 text-sm">Chargement...</p>
            </div>
          ) : (
            <>
              {/* Mes amis */}
              {activeTab === 'friends' && (
                friends.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <div className="text-3xl mb-2">👥</div>
                    <h3 className="text-base font-semibold text-gray-800 mb-1">
                      Aucun ami pour le moment
                    </h3>
                    <p className="text-gray-500 text-sm mb-3">
                      Commence par rechercher des utilisateurs !
                    </p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium text-sm transition-colors"
                    >
                      Chercher
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends.map((friend) => (
                      <div key={friend.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-3">
                        <div className="flex items-center gap-3">
                          <Link to={`/user/${friend.id}`}>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:scale-105 transition-transform">
                              {friend.username.charAt(0).toUpperCase()}
                            </div>
                          </Link>
                          <Link to={`/user/${friend.id}`} className="flex-1 hover:text-blue-600 transition-colors">
                            <h3 className="font-medium text-gray-900 text-sm">{friend.username}</h3>
                            <p className="text-xs text-gray-500 truncate">{friend.email}</p>
                          </Link>
                          <div className="flex gap-1.5">
                            <Link
                              to={`/messages?contact=${friend.id}`}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                            >
                              💬
                            </Link>
                            <button
                              onClick={() => handleRemove(friend.id, friend.username)}
                              className="bg-red-100 hover:bg-red-200 text-red-600 px-2.5 py-1.5 rounded-lg text-xs transition-colors"
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
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <div className="text-3xl mb-2">📥</div>
                    <h3 className="text-base font-semibold text-gray-800 mb-1">
                      Aucune demande reçue
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Les nouvelles demandes apparaîtront ici
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-3 border-l-3 border-blue-500">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {request.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm">{request.username}</h3>
                            <p className="text-xs text-gray-500 truncate">{request.email}</p>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleAccept(request.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1.5 rounded-lg text-xs transition-colors"
                            >
                              ✕
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
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <div className="text-3xl mb-2">📤</div>
                    <h3 className="text-base font-semibold text-gray-800 mb-1">
                      Aucune demande envoyée
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Tes demandes apparaîtront ici
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sentRequests.map((request) => (
                      <div key={request.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {request.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm">{request.username}</h3>
                            <p className="text-xs text-yellow-600 font-medium flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                              En attente
                            </p>
                          </div>
                          <button
                            onClick={() => handleCancelRequest(request.id)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            Annuler
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
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                    <div className="text-3xl mb-2">🔍</div>
                    <h3 className="text-base font-semibold text-gray-800 mb-1">
                      Aucun résultat
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Essaie un autre nom
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <div key={result.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {result.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm">{result.username}</h3>
                            <p className="text-xs text-gray-500 truncate">{result.email}</p>
                          </div>
                          <button
                            onClick={() => handleSendRequest(result.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            ➕
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
      
      <MobileNav />
    </div>
  );
}

export default Friends;