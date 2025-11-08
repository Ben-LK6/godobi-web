// src/components/MobileHeader.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

function MobileHeader({ title, showMenu = true }) {
  const [showMenuPanel, setShowMenuPanel] = useState(false);
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {showMenu && (
            <button 
              onClick={() => setShowMenuPanel(true)}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Menu Panel */}
      {showMenuPanel && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowMenuPanel(false)}
          ></div>
          
          {/* Panel */}
          <div className="absolute top-0 right-0 w-80 max-w-[85vw] h-full bg-white shadow-xl">
            <div className="p-4">
              {/* Header du menu */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                <button 
                  onClick={() => setShowMenuPanel(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Profil utilisateur */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{user?.username || 'Utilisateur'}</p>
                  <p className="text-sm text-gray-500">{user?.email || ''}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2 mb-6">
                <Link 
                  to="/profile" 
                  onClick={() => setShowMenuPanel(false)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-xl">👤</span>
                  <span className="font-medium">Mon Profil</span>
                </Link>
                
                <Link 
                  to="/gallery" 
                  onClick={() => setShowMenuPanel(false)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-xl">🖼️</span>
                  <span className="font-medium">Ma Galerie</span>
                </Link>
                
                <Link 
                  to="/temp-gallery" 
                  onClick={() => setShowMenuPanel(false)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-xl">📁</span>
                  <span className="font-medium">Galerie Temporaire</span>
                </Link>
                
                <div className="border-t border-gray-200 my-4"></div>
                
                <Link 
                  to="/settings" 
                  onClick={() => setShowMenuPanel(false)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-xl">⚙️</span>
                  <span className="font-medium">Paramètres</span>
                </Link>
                
                <Link 
                  to="/help" 
                  onClick={() => setShowMenuPanel(false)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-xl">❓</span>
                  <span className="font-medium">Aide</span>
                </Link>
              </nav>

              {/* Bouton déconnexion */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MobileHeader;