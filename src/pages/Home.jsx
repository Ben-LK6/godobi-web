// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGE_STYLES } from '../utils/constants';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-500">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-3xl font-heading font-bold text-white">
                🎨 Godobi
              </span>
            </div>
            <div className="flex gap-4">
                <Link to="/login" className="text-white hover:text-gray-200 px-4 py-2 rounded-lg transition-all">
                    Connexion
                 </Link>
                 <Link to="/register" className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                  S'inscrire
                 </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 leading-tight">
            Crée des images
            <span className="block bg-gradient-to-r from-accent-500 to-yellow-300 bg-clip-text text-transparent">
              stylisées uniques
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Transforme tes photos en œuvres d'art avec l'IA, ajoute des bulles personnalisées et partage avec tes amis
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl">
              ✨ Commencer gratuitement
            </button>
            <button className="bg-white/10 backdrop-blur-md text-white border-2 border-white/30 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
              📺 Voir la démo
            </button>
          </div>
        </div>

        {/* Styles disponibles */}
        <div className="mb-20">
          <h2 className="text-4xl font-heading font-bold text-white text-center mb-12">
            Styles disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {IMAGE_STYLES.map((style, index) => (
              <div
                key={style.id}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {style.icon}
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-2">
                  {style.name}
                </h3>
                <p className="text-white/70">
                  Transforme tes images en style {style.name.toLowerCase()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Fonctionnalités */}
        <div className="mb-20">
          <h2 className="text-4xl font-heading font-bold text-white text-center mb-12">
            Pourquoi Godobi ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-2">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-2xl font-heading font-bold text-gray-800 mb-3">
                Création facile
              </h3>
              <p className="text-gray-600">
                Interface intuitive pour créer des images stylisées en quelques clics
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-2">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-2xl font-heading font-bold text-gray-800 mb-3">
                Bulles personnalisées
              </h3>
              <p className="text-gray-600">
                Ajoute des bulles de dialogue comme dans les BD avec des outils puissants
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-2">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-2xl font-heading font-bold text-gray-800 mb-3">
                Partage social
              </h3>
              <p className="text-gray-600">
                Connecte-toi avec tes amis et partage tes créations facilement
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-heading font-bold text-white mb-4">
            Prêt à libérer ta créativité ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Rejoins des milliers de créateurs et commence dès maintenant
          </p>
          <button className="bg-accent-500 hover:bg-accent-600 text-white px-12 py-5 rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-2xl">
            🚀 Commencer gratuitement
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <p className="text-white/70">© 2025 Godobi. Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                À propos
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                Contact
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                Confidentialité
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;