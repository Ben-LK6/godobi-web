// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import messageService from '../services/messageService';
import notificationService from '../services/notificationService';

function Navbar() {
  const [user, setUser] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      loadUnreadCounts();
      
      // Rafraîchir toutes les 10 secondes
      const interval = setInterval(() => {
        loadUnreadCounts();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, []);

  const loadUnreadCounts = async () => {
    try {
      const [messagesResponse, notificationsResponse] = await Promise.all([
        messageService.countUnread(),
        notificationService.countUnread()
      ]);

      if (messagesResponse.success) {
        setUnreadMessages(messagesResponse.data.unread_count);
      }

      if (notificationsResponse.success) {
        setUnreadNotifications(notificationsResponse.data.unread_count);
      }
    } catch (error) {
      console.error('Erreur chargement compteurs:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Marquer comme lue
    if (notification.is_read === 0) {
      await notificationService.markAsRead(notification.id);
      loadUnreadCounts();
      loadNotifications();
    }

    // Rediriger selon le type
    setShowNotifications(false);
    
    switch (notification.type) {
      case 'like':
        navigate('/gallery');
        break;
      case 'comment':
        navigate('/feed');
        break;
      case 'friend_request':
        navigate('/friends');
        break;
      case 'friend_accept':
        navigate(`/user/${notification.sender_id}`);
        break;
      case 'message':
        navigate(`/messages?contact=${notification.sender_id}`);
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      loadUnreadCounts();
      loadNotifications();
    } catch (error) {
      console.error('Erreur marquage notifications:', error);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Te déconnecter ?')) {
      authService.logout();
      navigate('/');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'friend_request': return '👥';
      case 'friend_accept': return '✅';
      case 'message': return '📩';
      default: return '🔔';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} j`;
    return date.toLocaleDateString('fr-FR');
  };

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              Godobi
            </span>
          </Link>

          {/* Navigation centrale */}
          <div className="flex items-center gap-2">
            <Link
              to="/feed"
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all ${
                isActive('/feed')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-semibold hidden sm:block">Feed</span>
            </Link>
          </div>

          {/* Actions droite */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) loadNotifications();
                }}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>

              {/* Dropdown Notifications */}
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNotifications(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-20 max-h-96 overflow-hidden flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">Notifications</h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Tout marquer comme lu
                        </button>
                      )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="text-4xl mb-2">🔔</div>
                          <p className="text-gray-600 text-sm">Aucune notification</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                              notif.is_read === 0 ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                {notif.sender_username.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">{getNotificationIcon(notif.type)}</span>
                                  <p className="text-sm text-gray-800 font-semibold">
                                    {notif.sender_username}
                                  </p>
                                  {notif.is_read === 0 && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{notif.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatTime(notif.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Galerie */}
            <Link
              to="/gallery"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;