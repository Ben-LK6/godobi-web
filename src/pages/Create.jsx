// src/pages/Create.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import imageService from '../services/imageService';
import audioService from '../services/audioService';
import CameraCapture from '../components/CameraCapture';
import AudioController from '../components/AudioController';

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
  const [showPostModal, setShowPostModal] = useState(false);
  const [postType, setPostType] = useState('profile'); // 'story' ou 'profile'
  const [isPrivate, setIsPrivate] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [storyElements, setStoryElements] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [activeToolPanel, setActiveToolPanel] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfigOverlay, setShowConfigOverlay] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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

    // Vérifier si on vient de la galerie avec une image
    if (location.state?.imageUrl && location.state?.mode === 'post_from_gallery') {
      setPreviewUrl(location.state.imageUrl);
      setMode('gallery_post');
      setShowPostModal(true);
    }
    
    // Nettoyage lors du démontage
    return () => {
      audioService.cleanup();
    };
  }, [navigate, location.state]);

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
  const handleSaveToGallery = async (type, additionalData = {}) => {
    setIsSaving(true);
    
    try {
      // Convertir l'image en base64 pour éviter les erreurs de sécurité blob
      const base64Image = await imageService.imageToBase64(previewUrl);
      
      // Créer l'objet image
      const newImage = {
        id: Date.now(),
        url: base64Image, // Utiliser base64 au lieu de blob URL
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
  };

  // Ouvrir la modal de publication
  const handlePost = () => {
    setShowPostModal(true);
  };

  // Ajouter du texte sur la story
  const handleAddStoryText = () => {
    const text = prompt('Entrez votre texte:');
    if (text) {
      const newElement = {
        id: Date.now(),
        type: 'text',
        content: text,
        x: 50,
        y: 30 + (storyElements.length * 10),
        color: '#ffffff',
        size: 20
      };
      setStoryElements([...storyElements, newElement]);
    }
  };

  // Ajouter un sticker
  const handleAddSticker = (sticker) => {
    const newElement = {
      id: Date.now(),
      type: 'sticker',
      content: sticker,
      x: 50,
      y: 30 + (storyElements.length * 10),
      size: 30
    };
    setStoryElements([...storyElements, newElement]);
  };

  // Bibliothèque de musiques libres de droits (exemples)
  const musicLibrary = [
    { id: 1, name: "Chill Vibes", artist: "Lofi Beats", duration: 30, url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", isDemo: true },
    { id: 2, name: "Upbeat Energy", artist: "Pop Vibes", duration: 25, url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", isDemo: true },
    { id: 3, name: "Ambient Dreams", artist: "Relaxing", duration: 40, url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", isDemo: true }
  ];

  // Ajouter de la musique
  const handleAddMusic = () => {
    setActiveToolPanel(activeToolPanel === 'music' ? null : 'music');
  };

  // Sélectionner une musique
  const handleSelectMusic = (music) => {
    setSelectedMusic(music);
    setActiveToolPanel(null);
    // Arrêter la preview si elle joue
    if (audioPreview) {
      audioPreview.pause();
      setIsPlaying(false);
    }
  };

  // Preview audio avec le service
  const handlePreviewMusic = async (music, event) => {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    
    // Vérifier si c'est un fichier de démo
    if (music.isDemo) {
      alert('🎵 Fichier de démonstration\nImportez vos propres fichiers audio pour les écouter.');
      return;
    }
    
    try {
      console.log('Démarrage preview pour:', music.name, music.url);
      
      // Démarrer nouvelle preview
      await audioService.playPreview(music.url, Math.min(30, music.duration || 30));
      setIsPlaying(true);
      setAudioPreview({ src: music.url });
      
      console.log('Preview démarrée avec succès');
      
      // Arrêter automatiquement après la preview
      setTimeout(() => {
        console.log('Arrêt automatique de la preview');
        setIsPlaying(false);
        setAudioPreview(null);
        audioService.stopPreview();
      }, Math.min(30, music.duration || 30) * 1000);
      
    } catch (error) {
      console.error('Erreur preview audio:', error);
      setIsPlaying(false);
      setAudioPreview(null);
      alert('❌ Preview audio non disponible\nVérifiez que le fichier existe et est accessible.');
    }
  };

  // Upload fichier audio
  const handleMusicUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*,.mp3,.wav,.ogg,.m4a,.aac';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          // Créer l'objet audio avec validation
          const audioObject = await audioService.createAudioObject(file);
          setSelectedMusic(audioObject);
          setActiveToolPanel(null);
          
          // Optionnel: Upload vers l'API pour sauvegarde
          // const token = authService.getToken();
          // await audioService.uploadToAPI(file, token);
          
        } catch (error) {
          alert(`❌ ${error.message}`);
        }
      }
    };
    input.click();
  };

  // Taguer des amis
  const handleTagFriends = () => {
    // TODO: Implémenter sélecteur d'amis
    alert('👥 Sélecteur d\'amis bientôt disponible !');
  };

  // Publier le contenu
  const handlePublish = async () => {
    if (!postTitle.trim()) {
      alert('⚠️ Veuillez ajouter un titre');
      return;
    }

    setIsPosting(true);
    
    try {
      // Vérifier la connexion
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      
      if (!token || !currentUser) {
        alert('⚠️ Vous devez être connecté pour publier');
        navigate('/login');
        return;
      }

      // Convertir l'image en base64 pour l'API
      const base64Image = await imageService.imageToBase64(previewUrl);
      
      // Données pour l'API
      const postData = {
        title: postTitle,
        description: postDescription,
        generated_image: base64Image,
        is_private: postType === 'profile' ? isPrivate : false,
        post_type: postType, // 'story' ou 'profile'
        image_type: mode.includes('ai') ? 'ai' : mode.includes('camera') ? 'camera' : 'upload',
        music: selectedMusic ? {
          id: selectedMusic.id,
          name: selectedMusic.name,
          artist: selectedMusic.artist,
          url: selectedMusic.url,
          duration: selectedMusic.duration,
          isCustom: selectedMusic.isCustom || false,
          file: selectedMusic.file || null
        } : null,
        story_elements: storyElements,
        tagged_friends: taggedFriends
      };

      // Publier via l'API
      const response = await imageService.createImage(postData);
      
      if (response.success) {
        // Sauvegarder aussi dans la galerie locale avec base64
        const base64ForLocal = await imageService.imageToBase64(previewUrl);
        const imageData = {
          id: Date.now(),
          url: base64ForLocal, // Utiliser base64 pour localStorage
          type: mode.includes('ai') ? 'ai' : mode.includes('camera') ? 'camera' : 'upload',
          title: postTitle,
          description: postDescription,
          postType: postType,
          isPrivate: postType === 'profile' ? isPrivate : false,
          createdAt: new Date().toISOString()
        };

        setSavedImages(prev => {
          const updated = [imageData, ...prev];
          localStorage.setItem('godobi_temp_gallery', JSON.stringify(updated));
          return updated;
        });
        
        alert(`🚀 Publié sur ${postType === 'story' ? 'Story' : 'Profil'} ${postType === 'profile' && isPrivate ? '(Privé)' : '(Public)'}!`);
        
        // Reset
        setShowPostModal(false);
        setPostTitle('');
        setPostDescription('');
        setPostType('profile');
        setIsPrivate(false);
        setMode('prompt');
        
      } else {
        alert(`❌ Erreur: ${response.message}`);
      }
      
    } catch (error) {
      console.error('Erreur publication:', error);
      alert('❌ Erreur lors de la publication');
    } finally {
      setIsPosting(false);
    }
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
                            navigate('/image-editor', { state: { imageUrl: image.url } });
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
                  onClick={() => navigate('/image-editor', { state: { imageUrl: previewUrl } })}
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
                  onClick={() => navigate('/image-editor', { state: { imageUrl: previewUrl } })}
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
                  onClick={() => navigate('/image-editor', { state: { imageUrl: previewUrl } })}
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

        {/* MODE: Post depuis galerie */}
        {mode === 'gallery_post' && previewUrl && (
          <div className="w-full h-full relative">
            <img src={previewUrl} alt="Image de la galerie" className="w-full h-full object-contain bg-black" />
            
            <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 flex justify-center">
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Retour */}
                <button
                  onClick={() => navigate('/temp-gallery')}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-500/90 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-gray-500 transition-all active:scale-95 shadow-lg"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Éditer */}
                <button
                  onClick={() => navigate('/image-editor', { state: { imageUrl: previewUrl } })}
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
                  onClick={() => navigate('/image-editor', { state: { imageUrl: previewUrl } })}
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
                  onClick={() => navigate('/image-editor', { state: { imageUrl: previewUrl } })}
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

      {/* Interface de Publication Avancée */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-3 sm:p-4 pt-10 sm:pt-12">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowPostModal(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <span className="text-white font-semibold text-sm sm:text-base">Partager</span>
              
              <button
                onClick={handlePublish}
                disabled={!postTitle.trim() || isPosting}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  postTitle.trim() && !isPosting
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isPosting ? 'Publication...' : postTitle.trim() ? 'Partager' : 'Config requis'}
              </button>
            </div>
          </div>

          {/* Contenu Principal */}
          <div className="w-full h-full flex flex-col">
            {/* Zone Image - Plein écran sur mobile */}
            <div className="flex-1 relative flex items-center justify-center p-4 pt-20 pb-20 sm:pb-4">
              <div className="relative w-full max-w-sm aspect-[9/16] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={previewUrl} 
                  alt="Aperçu" 
                  className="w-full h-full object-cover"
                />
                
                {/* Sélecteur Type - En haut au centre */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <button
                    onClick={() => setActiveToolPanel(activeToolPanel === 'type' ? null : 'type')}
                    className={`px-4 py-2 backdrop-blur-md rounded-full flex items-center gap-2 transition-all border-2 ${
                      postType === 'story' 
                        ? 'bg-purple-500/80 border-purple-400 text-white shadow-lg shadow-purple-500/25' 
                        : 'bg-blue-500/80 border-blue-400 text-white shadow-lg shadow-blue-500/25'
                    }`}
                  >
                    <span className="text-lg">{postType === 'story' ? '📖' : '👤'}</span>
                    <span className="text-sm font-semibold">{postType === 'story' ? 'Story' : 'Profil'}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>



                {/* Outils Desktop seulement */}
                <div className="absolute top-4 right-4 hidden sm:flex flex-col gap-2">
                  {postType === 'story' && (
                    <button 
                      onClick={handleAddStoryText}
                      className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/80 transition-all border border-white/20"
                    >
                      <span className="text-white text-sm font-bold">Aa</span>
                    </button>
                  )}
                  
                  {postType === 'story' && (
                    <button 
                      onClick={() => setActiveToolPanel(activeToolPanel === 'stickers' ? null : 'stickers')}
                      className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/80 transition-all border border-white/20"
                    >
                      <span className="text-white text-sm">😀</span>
                    </button>
                  )}
                  
                  {/* Bouton Musique ou Contrôleur Audio */}
                  {selectedMusic ? (
                    <div className="bg-black/60 backdrop-blur-md rounded-full p-1 flex items-center gap-1 border border-white/20">
                      {/* Icône musique */}
                      <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                      
                      {/* Bouton Play/Pause */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (isPlaying && audioPreview?.src === selectedMusic.url) {
                            audioService.stopPreview();
                            setIsPlaying(false);
                            setAudioPreview(null);
                          } else {
                            try {
                              await handlePreviewMusic(selectedMusic, e);
                            } catch (error) {
                              console.error('Erreur play:', error);
                            }
                          }
                        }}
                        className="w-5 h-5 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                      >
                        {isPlaying && audioPreview?.src === selectedMusic.url ? (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                          </svg>
                        ) : (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        )}
                      </button>
                      
                      {/* Bouton Supprimer */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          audioService.stopPreview();
                          setIsPlaying(false);
                          setAudioPreview(null);
                          setSelectedMusic(null);
                        }}
                        className="w-5 h-5 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center transition-all"
                      >
                        <svg className="w-2.5 h-2.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleAddMusic}
                      className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/80 transition-all border border-white/20"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </button>
                  )}
                  
                  <button 
                    onClick={handleTagFriends}
                    className="w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/80 transition-all border border-white/20"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                </div>

                {/* Panneaux flottants */}
                {/* Stickers */}
                {activeToolPanel === 'stickers' && (
                  <div className="absolute top-4 right-16 sm:right-20 bg-black/80 backdrop-blur-md rounded-lg p-3 border border-white/20">
                    <div className="grid grid-cols-3 gap-2">
                      {['😀', '😍', '🔥', '💯', '✨', '❤️', '👍', '🎉'].map((sticker, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            handleAddSticker(sticker);
                            setActiveToolPanel(null);
                          }}
                          className="w-8 h-8 hover:scale-110 transition-transform rounded-lg hover:bg-white/10"
                        >
                          {sticker}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Type de publication */}
                {activeToolPanel === 'type' && (
                  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-md rounded-lg p-2 border border-white/20">
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setPostType('story');
                          setActiveToolPanel(null);
                        }}
                        className={`w-full px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${
                          postType === 'story'
                            ? 'bg-purple-500/30 text-purple-300'
                            : 'text-gray-400 hover:bg-purple-500/20'
                        }`}
                      >
                        <span>📖</span>
                        <span>Story</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setPostType('profile');
                          setActiveToolPanel(null);
                        }}
                        className={`w-full px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${
                          postType === 'profile'
                            ? 'bg-blue-500/30 text-blue-300'
                            : 'text-gray-400 hover:bg-blue-500/20'
                        }`}
                      >
                        <span>👤</span>
                        <span>Profil</span>
                      </button>
                      
                      {postType === 'profile' && (
                        <>
                          <div className="w-full h-px bg-gray-600 my-1"></div>
                          <button
                            onClick={() => setIsPrivate(!isPrivate)}
                            className={`w-full px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2 ${
                              !isPrivate
                                ? 'bg-green-500/30 text-green-300'
                                : 'bg-orange-500/30 text-orange-300'
                            }`}
                          >
                            <span>{isPrivate ? '🔒' : '🌍'}</span>
                            <span>{isPrivate ? 'Privé' : 'Public'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Titre */}
                {activeToolPanel === 'title' && (
                  <div className="absolute top-4 right-16 sm:right-20 bg-black/80 backdrop-blur-md rounded-lg p-3 border border-white/20 w-64">
                    <input
                      type="text"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="Titre de votre création..."
                      className="w-full px-3 py-2 bg-gray-800/80 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 text-sm"
                      maxLength={100}
                      autoFocus
                    />
                    <p className="text-xs text-gray-400 mt-1">{postTitle.length}/100</p>
                    <button
                      onClick={() => setActiveToolPanel(null)}
                      className="w-full mt-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                    >
                      OK
                    </button>
                  </div>
                )}

                {/* Description */}
                {activeToolPanel === 'desc' && (
                  <div className="absolute top-4 right-16 sm:right-20 bg-black/80 backdrop-blur-md rounded-lg p-3 border border-white/20 w-64">
                    <textarea
                      value={postDescription}
                      onChange={(e) => setPostDescription(e.target.value)}
                      placeholder="Décrivez votre création..."
                      className="w-full px-3 py-2 bg-gray-800/80 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 text-sm resize-none"
                      rows="3"
                      maxLength={500}
                      autoFocus
                    />
                    <p className="text-xs text-gray-400 mt-1">{postDescription.length}/500</p>
                    <button
                      onClick={() => setActiveToolPanel(null)}
                      className="w-full mt-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                    >
                      OK
                    </button>
                  </div>
                )}

                {/* Sélecteur de Musique */}
                {activeToolPanel === 'music' && (
                  <div className="absolute top-4 right-16 sm:right-20 bg-black/90 backdrop-blur-md rounded-lg border border-white/20 w-72 max-h-80 overflow-hidden">
                    {/* Header */}
                    <div className="p-3 border-b border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-medium text-sm">Ajouter une musique</h3>
                        <button
                          onClick={() => setActiveToolPanel(null)}
                          className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                        >
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Bouton Upload */}
                      <button
                        onClick={handleMusicUpload}
                        className="w-full p-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-300 text-xs hover:bg-blue-500/30 transition-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Importer ma musique</span>
                      </button>
                    </div>

                    {/* Liste des musiques */}
                    <div className="max-h-60 overflow-y-auto">
                      <div className="p-2">
                        <p className="text-xs text-gray-400 mb-2 px-1">Bibliothèque</p>
                        <div className="space-y-1">
                          {musicLibrary.map((music) => (
                            <div
                              key={music.id}
                              className={`w-full p-2 rounded-lg transition-all hover:bg-white/10 cursor-pointer ${
                                selectedMusic?.id === music.id ? 'bg-green-500/20 border border-green-400/30' : ''
                              }`}
                              onClick={() => handleSelectMusic(music)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-xs font-medium truncate">{music.name}</p>
                                  <p className="text-gray-400 text-[10px] truncate">{music.artist}</p>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                  <span className="text-[10px] text-gray-400">{music.duration}s</span>
                                  
                                  {/* Bouton Preview */}
                                  <button
                                    onClick={(e) => handlePreviewMusic(music, e)}
                                    className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
                                  >
                                    {isPlaying && audioPreview?.src.includes(music.url) ? (
                                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                      </svg>
                                    )}
                                  </button>
                                  
                                  {selectedMusic?.id === music.id && (
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Musique sélectionnée */}
                    {selectedMusic && (
                      <div className="p-3 border-t border-gray-600 bg-gray-800/50">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium truncate">{selectedMusic.name}</p>
                            <p className="text-green-400 text-[10px]">{selectedMusic.artist}</p>
                          </div>
                          <button
                            onClick={() => setSelectedMusic(null)}
                            className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center hover:bg-red-500/30"
                          >
                            <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Boutons d'Action Mobile - Alignés sous les outils */}
                <div className="absolute top-4 right-4 sm:hidden">
                  <div className="flex flex-col gap-2">
                    {/* Outils existants */}
                    {postType === 'story' && (
                      <button 
                        onClick={handleAddStoryText}
                        className="w-7 h-7 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/80 transition-all border border-white/20"
                      >
                        <span className="text-white text-xs font-bold">Aa</span>
                      </button>
                    )}
                    
                    {postType === 'story' && (
                      <button 
                        onClick={() => setActiveToolPanel(activeToolPanel === 'stickers' ? null : 'stickers')}
                        className="w-7 h-7 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/80 transition-all border border-white/20"
                      >
                        <span className="text-white text-xs">😀</span>
                      </button>
                    )}
                    
                    {/* Bouton Musique ou Contrôleur Audio Mobile */}
                    {selectedMusic ? (
                      <div className="bg-black/60 backdrop-blur-md rounded-full p-1 flex items-center gap-1 border border-white/20">
                        <div className="w-5 h-5 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        </div>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (isPlaying && audioPreview?.src === selectedMusic.url) {
                              audioService.stopPreview();
                              setIsPlaying(false);
                              setAudioPreview(null);
                            } else {
                              try {
                                await handlePreviewMusic(selectedMusic, e);
                              } catch (error) {
                                console.error('Erreur play:', error);
                              }
                            }
                          }}
                          className="w-4 h-4 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                        >
                          {isPlaying && audioPreview?.src === selectedMusic.url ? (
                            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                            </svg>
                          ) : (
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            audioService.stopPreview();
                            setIsPlaying(false);
                            setAudioPreview(null);
                            setSelectedMusic(null);
                          }}
                          className="w-4 h-4 bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center transition-all"
                        >
                          <svg className="w-2 h-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={handleAddMusic}
                        className="w-7 h-7 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/80 transition-all border border-white/20"
                      >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </button>
                    )}
                    
                    <button 
                      onClick={handleTagFriends}
                      className="w-7 h-7 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/80 transition-all border border-white/20"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>

                    {/* Séparateur */}
                    <div className="w-7 h-px bg-white/30 my-1"></div>

                    {/* Boutons de Configuration */}


                    {/* Titre */}
                    <button
                      onClick={() => setActiveToolPanel(activeToolPanel === 'title' ? null : 'title')}
                      className={`w-7 h-7 backdrop-blur-md rounded-full flex items-center justify-center transition-all border ${
                        postTitle.trim() 
                          ? 'bg-green-500/80 border-green-400 text-white' 
                          : 'bg-red-500/80 border-red-400 text-white'
                      }`}
                    >
                      <span className="text-xs font-bold">T</span>
                    </button>

                    {/* Description */}
                    <button
                      onClick={() => setActiveToolPanel(activeToolPanel === 'desc' ? null : 'desc')}
                      className={`w-7 h-7 backdrop-blur-md rounded-full flex items-center justify-center transition-all border ${
                        postDescription.trim() 
                          ? 'bg-green-500/80 border-green-400 text-white' 
                          : 'bg-gray-500/80 border-gray-400 text-white'
                      }`}
                    >
                      <span className="text-xs">D</span>
                    </button>


                  </div>
                </div>



                {/* Éléments ajoutés sur la story */}
                {storyElements.map((element) => (
                  <div
                    key={element.id}
                    style={{
                      position: 'absolute',
                      left: `${element.x}%`,
                      top: `${element.y}%`,
                      transform: 'translate(-50%, -50%)',
                      color: element.color,
                      fontSize: `${element.size}px`,
                      cursor: 'move',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                    className="select-none group"
                  >
                    {element.content}
                    
                    {/* Bouton supprimer */}
                    <button
                      onClick={() => setStoryElements(storyElements.filter(el => el.id !== element.id))}
                      className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Informations en bas */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4">
                  <div className="text-white">
                    <p className="font-semibold text-xs sm:text-sm mb-1 truncate">{postTitle || 'Titre...'}</p>
                    <p className="text-[10px] sm:text-xs text-white/80 line-clamp-2">{postDescription || 'Description...'}</p>
                    
                    {/* Indicateurs et Bouton Partager */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          postType === 'story' ? 'bg-purple-500/30 text-purple-300' : 'bg-blue-500/30 text-blue-300'
                        }`}>
                          {postType === 'story' ? '📖 Story' : '👤 Profil'}
                        </span>
                        
                        {postType === 'profile' && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            isPrivate ? 'bg-orange-500/30 text-orange-300' : 'bg-green-500/30 text-green-300'
                          }`}>
                            {isPrivate ? '🔒 Privé' : '🌍 Public'}
                          </span>
                        )}
                        
                        {storyElements.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/30 text-yellow-300">
                            ✨ {storyElements.length}
                          </span>
                        )}
                        
                        {selectedMusic && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/30 text-pink-300">
                            🎵 {selectedMusic.name}
                          </span>
                        )}
                      </div>

                      {/* Bouton Partager Mobile */}
                      <div className="sm:hidden">
                        <button
                          onClick={handlePublish}
                          disabled={!postTitle.trim() || isPosting}
                          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                            postTitle.trim() && !isPosting
                              ? 'bg-white text-black hover:bg-gray-200'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isPosting ? (
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              <span>Publication...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                              <span>Partager</span>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panneau de Configuration Desktop */}
            <div className="hidden sm:block w-80 bg-gray-900 p-6 overflow-y-auto absolute right-0 top-0 bottom-0">
              {/* Type de publication */}
              <div className="mb-6">
                <p className="text-white font-medium mb-3">Type de publication</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPostType('story')}
                    className={`p-3 rounded-xl border transition-all ${
                      postType === 'story'
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">📖</div>
                      <p className="text-xs font-medium">Story</p>
                      <p className="text-[10px] opacity-70">24h</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setPostType('profile')}
                    className={`p-3 rounded-xl border transition-all ${
                      postType === 'profile'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                        : 'border-gray-600 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">👤</div>
                      <p className="text-xs font-medium">Profil</p>
                      <p className="text-[10px] opacity-70">Permanent</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Confidentialité (seulement pour profil) */}
              {postType === 'profile' && (
                <div className="mb-6">
                  <p className="text-white font-medium mb-3">Confidentialité</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsPrivate(false)}
                      className={`w-full p-3 rounded-lg border transition-all flex items-center gap-3 ${
                        !isPrivate
                          ? 'border-green-500 bg-green-500/20 text-green-300'
                          : 'border-gray-600 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <span className="text-lg">🌍</span>
                      <div className="text-left">
                        <p className="text-sm font-medium">Public</p>
                        <p className="text-xs opacity-70">Visible par tous</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setIsPrivate(true)}
                      className={`w-full p-3 rounded-lg border transition-all flex items-center gap-3 ${
                        isPrivate
                          ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                          : 'border-gray-600 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <span className="text-lg">🔒</span>
                      <div className="text-left">
                        <p className="text-sm font-medium">Privé</p>
                        <p className="text-xs opacity-70">Amis seulement</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Titre */}
              <div className="mb-4">
                <label className="block text-white font-medium mb-2 text-sm">
                  Titre *
                </label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Titre de votre création..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                  maxLength={100}
                />
                <p className="text-xs text-gray-400 mt-1">{postTitle.length}/100</p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-2 text-sm">
                  Description
                </label>
                <textarea
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  placeholder="Décrivez votre création..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none text-sm"
                  rows="3"
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 mt-1">{postDescription.length}/500</p>
              </div>

              {/* Options Avancées */}
              <div className="space-y-3">
                <button 
                  onClick={handleAddMusic}
                  className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-3 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  {selectedMusic ? `🎵 ${selectedMusic.name}` : 'Ajouter une musique'}
                </button>
                
                <button 
                  onClick={handleTagFriends}
                  className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-3 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {taggedFriends.length > 0 ? `👥 ${taggedFriends.length} ami(s) taggé(s)` : 'Taguer des amis'}
                </button>
                
                {/* Indicateur d'éléments ajoutés */}
                {storyElements.length > 0 && (
                  <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm font-medium">
                      ✨ {storyElements.length} élément(s) ajouté(s) sur votre story
                    </p>
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>
      )}
    </div>
  );
}

export default Create;