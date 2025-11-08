// src/components/MobileNav.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';

function MobileNav() {
  const location = useLocation();
  const user = authService.getCurrentUser();
  
  const isActive = (path) => location.pathname === path;
  
  const navItems = [
    { path: '/feed', icon: '🏠', label: 'Feed' },
    { path: '/stories', icon: '📖', label: 'Stories' },
    { path: '/create', icon: '+', label: 'Créer', isSpecial: true },
    { path: '/messages', icon: '💬', label: 'Messages' },
    { path: '/profile', icon: user?.username?.charAt(0).toUpperCase() || '?', label: 'Profil', isAvatar: true }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path} 
            className={`flex flex-col items-center p-2 transition-colors ${
              isActive(item.path) ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            {item.isSpecial ? (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-1">
                <span className="text-white text-lg">{item.icon}</span>
              </div>
            ) : item.isAvatar ? (
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-1">
                <span className="text-white text-xs font-bold">{item.icon}</span>
              </div>
            ) : (
              <span className="text-xl mb-1">{item.icon}</span>
            )}
            <span className={`text-xs ${isActive(item.path) ? 'font-medium' : ''}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MobileNav;