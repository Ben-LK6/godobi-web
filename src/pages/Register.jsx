// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthdate: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Efface l'erreur du champ modifié
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation username
    if (formData.username.length < 3) {
      newErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    // Validation password
    if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    // Validation confirmPassword
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    // Validation birthdate (âge minimum 13 ans)
    if (formData.birthdate) {
      const birthDate = new Date(formData.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        newErrors.birthdate = 'Tu dois avoir au moins 13 ans pour créer un compte';
      }
    } else {
      newErrors.birthdate = 'La date de naissance est requise';
    }

    // Validation acceptTerms
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Tu dois accepter les conditions d\'utilisation';
    }

    return newErrors;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const newErrors = validateForm();

  if (Object.keys(newErrors).length === 0) {
    try {
      // Appel à l'API
      const response = await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        birthdate: formData.birthdate,
        language: 'fr'
      });

      // Si succès, rediriger vers le dashboard (on le créera plus tard)
      alert('🎉 Compte créé avec succès ! Bienvenue sur Godobi !');
      console.log('Utilisateur créé:', response.data.user);
      
      // Pour l'instant, on redirige vers la page d'accueil
      window.location.href = '/dashboard';
      
    } catch (error) {
      // Gérer les erreurs de l'API
      if (error.errors) {
        setErrors(error.errors);
      } else {
        alert('❌ Erreur: ' + (error.message || 'Une erreur est survenue'));
      }
    }
  } else {
    setErrors(newErrors);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-500 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-5xl font-heading font-bold text-white hover:scale-110 transition-transform inline-block">
              🎨 Godobi
            </span>
          </Link>
          <h2 className="text-3xl font-heading font-bold text-white mt-4 mb-2">
            Rejoins Godobi !
          </h2>
          <p className="text-white/80">
            Crée ton compte gratuitement en 2 minutes
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="ton_pseudo"
                required
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                  errors.username ? 'border-red-500' : 'border-gray-200 focus:border-primary-500'
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
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
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                  errors.email ? 'border-red-500' : 'border-gray-200 focus:border-primary-500'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Date de naissance */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Date de naissance
              </label>
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                  errors.birthdate ? 'border-red-500' : 'border-gray-200 focus:border-primary-500'
                }`}
              />
              {errors.birthdate && (
                <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="mb-4">
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
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                  errors.password ? 'border-red-500' : 'border-gray-200 focus:border-primary-500'
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-200 focus:border-primary-500'
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Accepter les CGU */}
            <div className="mb-6">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className={`w-5 h-5 mt-1 text-primary-500 border-gray-300 rounded focus:ring-primary-500 ${
                    errors.acceptTerms ? 'border-red-500' : ''
                  }`}
                />
                <span className="ml-3 text-gray-700 text-sm">
                  J'accepte les{' '}
                  <a href="#" className="text-primary-500 hover:text-primary-600 font-semibold">
                    conditions d'utilisation
                  </a>{' '}
                  et la{' '}
                  <a href="#" className="text-primary-500 hover:text-primary-600 font-semibold">
                    politique de confidentialité
                  </a>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-red-500 text-sm mt-1">{errors.acceptTerms}</p>
              )}
            </div>

            {/* Bouton d'inscription */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-accent-500 to-accent-600 text-white py-3 rounded-lg font-bold text-lg hover:from-accent-600 hover:to-accent-700 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              Créer mon compte
            </button>
          </form>

          {/* Lien connexion */}
          <p className="text-center text-gray-600 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-bold">
              Se connecter
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

export default Register;