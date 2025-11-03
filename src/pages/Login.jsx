// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // Appel à l'API
    const response = await authService.login({
      email: formData.email,
      password: formData.password
    });

    // Si succès
    alert('✅ Connexion réussie ! Bon retour ' + response.data.user.username + ' !');
    console.log('Utilisateur connecté:', response.data.user);
    
    // Pour l'instant, on redirige vers la page d'accueil
    window.location.href = '/dashboard';
    
  } catch (error) {
    // Gérer les erreurs
    alert('❌ Erreur: ' + (error.message || 'Email ou mot de passe incorrect'));
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-500 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo et retour */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-5xl font-heading font-bold text-white hover:scale-110 transition-transform inline-block">
              🎨 Godobi
            </span>
          </Link>
          <h2 className="text-3xl font-heading font-bold text-white mt-4 mb-2">
            Bon retour !
          </h2>
          <p className="text-white/80">
            Connecte-toi pour continuer à créer
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ton@email.com"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Mot de passe */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Se souvenir / Mot de passe oublié */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-700">Se souvenir de moi</span>
              </label>
              <a href="#" className="text-primary-500 hover:text-primary-600 font-semibold text-sm">
                Mot de passe oublié ?
              </a>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-lg font-bold text-lg hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              Se connecter
            </button>
          </form>

          {/* Séparateur */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">OU</span>
            </div>
          </div>

          {/* Connexion sociale (désactivée pour l'instant) */}
          <div className="space-y-3">
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-400 py-3 rounded-lg font-semibold cursor-not-allowed"
            >
              <span className="text-xl">🔵</span>
              Continuer avec Google (Bientôt)
            </button>
          </div>

          {/* Lien inscription */}
          <p className="text-center text-gray-600 mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-600 font-bold">
              S'inscrire gratuitement
            </Link>
          </p>
        </div>

        {/* Retour à l'accueil */}
        <div className="text-center mt-6">
          <Link to="/" className="text-white/80 hover:text-white font-semibold">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;