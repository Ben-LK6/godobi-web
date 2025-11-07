// src/pages/Create.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import imageService from '../services/imageService';
import CameraCapture from '../components/CameraCapture';

function Create() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('prompt'); // prompt, camera, upload, edit
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [savedImages, setSavedImages] = useState([]);
  const [showGallery, setShowGallery] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Styles IA disponibles
  const aiStyles = [
    { id: 'realistic', name: 'Réaliste', emoji: '📸', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'comic', name: 'BD', emoji: '📚', gradient: 'from-yellow-500 to-orange-500' },
    { id: 'anime', name: 'Anime', emoji: '🎌', gradient: 'from-pink-500 to-rose-500' },
    { id: 'cartoon', name: 'Cartoon', emoji: '🎨', gradient: 'from-purple-500 to-violet-500' },
    { id: 'watercolor', name: 'Aquarelle', emoji: '🖌️', gradient: 'from-teal-500 to-emerald-500' },
    { id: 'cyberpunk', name: 'Cyberpunk', emoji: '🌃', gradient: 'from-indigo-500 to-purple-500' }
  ];

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    setUser(authService.getCurrentUser());
    
    // Charger les images sauvegardées
    const saved = localStorage.getItem('godobi_temp_gallery');
    if (saved) {
      setSavedImages(JSON.parse(saved));
    }
  }, [navigate]);

  // Générer depuis prompt
  const handleGenerateFromPrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    // TODO: Appel API IA
    setTimeout(() => {
      setIsGenerating(false);
      const generatedUrl = 'https://picsum.photos/400/600';
      setPreviewUrl(generatedUrl);
      setMode('ai_result');
    }, 3000);
  };

  // Améliorer avec IA
  const handleEnhanceWithAI = async () => {
    setIsEnhancing(true);
    // TODO: Appel API IA pour amélioration
    setTimeout(() => {
      setIsEnhancing(false);
      const enhancedUrl = 'https://picsum.photos/400/600?random=' + Date.now();
      setPreviewUrl(enhancedUrl);
      setMode('enhanced_result');
    }, 2000);
  };

  // Sauvegarder dans galerie temporaire
  const handleSaveToGallery = (type, additionalData = {}) => {
    setIsSaving(true);
    
    setTimeout(() => {
      try {
        // Créer l'objet image
        const newImage = {
          id: Date.now(),
          url: previewUrl,
          type: type,
          createdAt: new Date().toISOString(),
          ...additionalData
        };

        // Ajouter à la galerie locale
        setSavedImages(prev => {
          const updated = [newImage, ...prev];
          // Sauvegarder dans localStorage
          localStorage.setItem('godobi_temp_gallery', JSON.stringify(updated));
          return updated;
        });
        
        alert('✅ Sauvegardé dans la galerie temporaire !');
      } catch (error) {
        console.error('Erreur sauvegarde:', error);
        alert('❌ Erreur lors de la sauvegarde');
      } finally {
        setIsSaving(false);
      }
    }, 500); // Simule un délai
  };

  // Poster directement
  const handlePost = () => {
    // TODO: Poster sur le feed
    alert('🚀 Posté sur le feed !');
    setMode('prompt');
  };

  // Ouvrir la caméra
  const handleOpenCamera = () => {
    setShowCamera(true);
  };

  // Capture depuis caméra
  const handleCameraCapture = (file, url) => {
    setSelectedImage(file);
    setPreviewUrl(url);
    setShowCamera(false);
    setMode('camera_preview');
  };

  // Upload depuis galerie
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setSelectedImage(file);
      setPreviewUrl(url);
      setMode('upload_preview');
    }
  };

  // Fermer la caméra
  const handleCloseCamera = () => {
    setShowCamera(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black">
      {/* Interface principale */}
      <div className="relative w-full h-screen overflow-hidden">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-3 sm:p-4 pt-10 sm:pt-12">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/feed')}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span className="text-white font-semibold text-sm sm:text-base">Créer</span>
            
            <div className="relative">
              <button
                onClick={() => {
                  if (savedImages.length > 0) {
                    navigate('/temp-gallery');
                  } else {
                    setShowGallery(!showGallery);
                  }
                }}
                className="relative w-8 h-8 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all overflow-hidden"
              >
                {savedImages.length > 0 ? (
                  <>
                    <img 
                      src={savedImages[0].url} 
                      alt="Galerie" 
                      className="w-full h-full object-cover rounded-full"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-full"></div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 text-white text-[8px] sm:text-[10px] font-bold rounded-full flex items-center justify-center border border-black">
                      {savedImages.length > 9 ? '9+' : savedImages.length}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center border-2 border-white/30">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Mini galerie dropdown */}
              {showGallery && savedImages.length > 0 && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowGallery(false)}></div>
                  <div className="absolute top-full right-0 mt-2 w-48 sm:w-56 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-3 z-50">
                    <div className="grid grid-cols-3 gap-2">
                      {savedImages.slice(0, 6).map((image) => (
                        <button
                          key={image.id}
                          onClick={() => {
                            navigate('/editor', { state: { imageUrl: image.url } });
                            setShowGallery(false);
                          }}
                          className="relative aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform"
                        >
                          <img 
                            src={image.url} 
                            alt="Création" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1 right-1 text-[8px] bg-black/70 text-white px-1 rounded">
                            {image.type === 'ai' && '✨'}
                            {image.type === 'camera_enhanced' && '📷'}
                            {image.type === 'upload_enhanced' && '🖼️'}
                          </div>
                        </button>
                      ))}
                    </div>
                    {savedImages.length > 6 && (
                      <button
                        onClick={() => {
                          navigate('/temp-gallery');
                          setShowGallery(false);
                        }}
                        className="w-full mt-2 text-white/60 text-xs hover:text-white transition-colors"
                      >
                        Voir tout ({savedImages.length})
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* MODE: Génération par prompt */}
        {mode === 'prompt' && (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex flex-col">
            
            {/* Zone centrale */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6">
              <div className="text-center mb-6 sm:mb-8">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">✨</div>
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Crée avec l'IA
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Décris ce que tu veux générer
                </p>
              </div>

              {/* Sélecteur de style */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/80 text-xs sm:text-sm">Style IA</p>
                  <button
                    onClick={() => setShowStyleSelector(!showStyleSelector)}
                    className="text-purple-400 text-xs sm:text-sm font-medium hover:text-purple-300 transition-colors"
                  >
                    {showStyleSelector ? 'Moins' : 'Tous'}
                  </button>
                </div>
                
                <div className={`gap-1.5 sm:gap-2 transition-all duration-300 ${
                  showStyleSelector ? 'grid grid-cols-3 sm:grid-cols-4' : 'flex overflow-x-auto pb-2'
                }`}>
                  {(showStyleSelector ? aiStyles : aiStyles.slice(0, 4)).map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`flex-shrink-0 ${showStyleSelector ? 'w-full h-14 sm:h-16' : 'w-12 h-12 sm:w-14 sm:h-14'} rounded-xl sm:rounded-2xl transition-all ${
                        selectedStyle === style.id
                          ? `bg-gradient-to-br ${style.gradient} scale-105 shadow-lg border border-white/30`
                          : 'bg-white/10 hover:bg-white/20 border border-transparent'
                      }`}
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <span className={`${showStyleSelector ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'} mb-0.5`}>{style.emoji}</span>
                        <span className={`${showStyleSelector ? 'text-[10px] sm:text-xs' : 'text-[8px] sm:text-[9px]'} text-white font-medium leading-tight`}>{style.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Zone de prompt */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <span className="text-white/80 text-xs sm:text-sm font-medium">Décris ton idée</span>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Un portrait style manga avec des couleurs vives..."
                  className="w-full bg-transparent text-white placeholder-white/50 resize-none focus:outline-none text-sm sm:text-base leading-relaxed"
                  rows="3"
                />
                <div className="flex justify-between items-center mt-2 sm:mt-3">
                  <span className="text-white/40 text-[10px] sm:text-xs">
                    {prompt.length}/500
                  </span>
                  {prompt.length > 0 && (
                    <button
                      onClick={() => setPrompt('')}
                      className="text-white/40 hover:text-white/60 transition-colors p-1"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Boutons d'action en bas */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* Bouton principal - Générer */}
              <button
                onClick={handleGenerateFromPrompt}
                disabled={!prompt.trim() || isGenerating}
                className={`group w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 transform ${
                  prompt.trim() && !isGenerating
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl active:scale-[0.98]'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <div className="relative">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-xs">
                        ✨
                      </div>
                    </div>
                    <span className="hidden sm:inline">Création magique en cours...</span>
                    <span className="sm:hidden">Génération...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg sm:text-xl group-hover:animate-pulse">✨</span>
                    <span>Générer avec IA</span>
                  </div>
                )}
              </button>

              {/* Boutons secondaires */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={handleOpenCamera}
                  className="group bg-white/10 hover:bg-white/20 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-medium transition-all duration-300 flex flex-col items-center justify-center gap-1 sm:gap-2 border border-white/20 hover:border-white/40 active:scale-[0.98]"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm">Caméra</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group bg-white/10 hover:bg-white/20 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-medium transition-all duration-300 flex flex-col items-center justify-center gap-1 sm:gap-2 border border-white/20 hover:border-white/40 active:scale-[0.98]"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm">Galerie</span>
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}



        {/* MODE: Résultat IA (depuis prompt) */}
        {mode === 'ai_result' && previewUrl && (
          <div className="w-full h-full relative">
            <img src={previewUrl} alt="Généré par IA" className="w-full h-full object-contain bg-black" />
            
            <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Enregistrer */}
                <button
                  onClick={() => handleSaveToGallery('ai', { prompt, style: selectedStyle })}
                  disabled={isSaving}
                  className={`w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-blue-500 transition-all active:scale-95 shadow-lg ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  )}
                </button>

                {/* Éditer */}
                <button
                  onClick={() => navigate('/editor', { state: { imageUrl: previewUrl } })}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-purple-500 transition-all active:scale-95 shadow-lg"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                {/* Poster */}
                <button
                  onClick={handlePost}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-green-500 transition-all active:scale-95 shadow-lg"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODE: Aperçu caméra */}
        {mode === 'camera_preview' && previewUrl && (
          <div className="w-full h-full relative">
            <img src={previewUrl} alt="Photo caméra" className="w-full h-full object-contain bg-black" />
            
            {/* Boutons d'action circulaires */}
            <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Enregistrer */}
                <button
                  onClick={() => handleSaveToGallery('camera')}
                  disabled={isSaving}
                  className={`w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-blue-500 transition-all active:scale-95 shadow-lg ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  )}
                </button>

                {/* Éditer */}
                <button
                  onClick={() => navigate('/editor', { state: { imageUrl: previewUrl } })}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-purple-500 transition-all active:scale-95 shadow-lg"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                {/* Revoir avec IA */}
                <button
                  onClick={handleEnhanceWithAI}
                  disabled={isEnhancing}
                  className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center hover:scale-105 transition-all active:scale-95 shadow-xl"
                >
                  {isEnhancing ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-2xl">✨</span>
                  )}
                </button>

                {/* Poster */}
                <button
                  onClick={handlePost}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-green-500 transition-all active:scale-95 shadow-lg"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODE: Aperçu upload */}
        {mode === 'upload_preview' && previewUrl && (
          <div className="w-full h-full relative">
            <img src={previewUrl} alt="Photo importée" className="w-full h-full object-contain bg-black" />
            
            {/* Boutons d'action circulaires */}
            <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Enregistrer */}
                <button
                  onClick={() => handleSaveToGallery('upload')}
                  disabled={isSaving}
                  className={`w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-blue-500 transition-all active:scale-95 shadow-lg ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  )}
                </button>

                {/* Éditer */}
                <button
                  onClick={() => navigate('/editor', { state: { imageUrl: previewUrl } })}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-purple-500 transition-all active:scale-95 shadow-lg"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                {/* Améliorer avec IA */}
                <button
                  onClick={handleEnhanceWithAI}
                  disabled={isEnhancing}
                  className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center hover:scale-105 transition-all active:scale-95 shadow-xl"
                >
                  {isEnhancing ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-2xl">✨</span>
                  )}
                </button>

                {/* Poster */}
                <button
                  onClick={handlePost}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-green-500 transition-all active:scale-95 shadow-lg"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODE: Résultat amélioré */}
        {mode === 'enhanced_result' && previewUrl && (
          <div className="w-full h-full relative">
            <img src={previewUrl} alt="Amélioré par IA" className="w-full h-full object-contain bg-black" />
            
            <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Enregistrer */}
                <button
                  onClick={() => handleSaveToGallery(selectedImage ? 'camera_enhanced' : 'upload_enhanced')}
                  disabled={isSaving}
                  className={`w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-blue-500 transition-all active:scale-95 shadow-lg ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  )}
                </button>

                {/* Éditer */}
                <button
                  onClick={() => navigate('/editor', { state: { imageUrl: previewUrl } })}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-purple-500 transition-all active:scale-95 shadow-lg"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                {/* Poster */}
                <button
                  onClick={handlePost}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-green-500 transition-all active:scale-95 shadow-lg"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODE: Édition (ancien) */}
        {mode === 'edit' && previewUrl && (
          <div className="w-full h-full relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-contain bg-black"
            />

            {/* Boutons d'action flottants */}
            <div className="absolute top-16 sm:top-20 right-3 sm:right-4 space-y-2 sm:space-y-3 z-10">
              <button
                onClick={() => setMode('prompt')}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/80 transition-all border border-white/20 active:scale-95"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Boutons d'action en bas */}
            <div className="absolute bottom-4 sm:bottom-6 left-3 sm:left-4 right-3 sm:right-4 space-y-2 sm:space-y-3">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={() => navigate('/editor', { state: { imageUrl: previewUrl } })}
                  className="group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-1 sm:gap-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-sm sm:text-base">Éditer</span>
                </button>
                
                <button
                  onClick={handlePost}
                  className="group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-1 sm:gap-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span className="text-sm sm:text-base">Poster</span>
                </button>
              </div>
              
              <button
                onClick={() => {
                  // TODO: Partager
                  alert('🚀 Partage bientôt disponible !');
                }}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all border border-white/20 hover:border-white/40 flex items-center justify-center gap-2"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span className="text-xs sm:text-sm">Partager</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Composant Caméra */}
      <CameraCapture
        isOpen={showCamera}
        onCapture={handleCameraCapture}
        onClose={handleCloseCamera}
      />
    </div>
  );
}

export default Create;