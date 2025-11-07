// src/pages/Editor.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

function Editor() {
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState('select'); // select, camera, preview, generate, edit
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [showPromptInput, setShowPromptInput] = useState(false);
  
  // État éditeur
  const [textBubbles, setTextBubbles] = useState([]);
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [bubbleText, setBubbleText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Styles IA disponibles
  const aiStyles = [
    { id: 'realistic', name: 'Réaliste', emoji: '📸', color: 'from-blue-500 to-cyan-500' },
    { id: 'comic', name: 'BD', emoji: '📚', color: 'from-yellow-500 to-orange-500' },
    { id: 'anime', name: 'Anime', emoji: '🎌', color: 'from-pink-500 to-rose-500' },
    { id: 'cartoon', name: 'Cartoon', emoji: '🎨', color: 'from-purple-500 to-violet-500' },
    { id: 'watercolor', name: 'Aquarelle', emoji: '🖌️', color: 'from-teal-500 to-emerald-500' },
    { id: 'cyberpunk', name: 'Cyberpunk', emoji: '🌃', color: 'from-indigo-500 to-purple-500' },
    { id: 'fantasy', name: 'Fantasy', emoji: '🧙', color: 'from-violet-500 to-fuchsia-500' },
    { id: 'sketch', name: 'Croquis', emoji: '✏️', color: 'from-gray-500 to-slate-500' }
  ];

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, [navigate]);

  // Ouvrir la caméra
  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
        setShowCamera(true);
        setCurrentStep('camera');
      }
    } catch (error) {
      console.error('Erreur accès caméra:', error);
      alert('❌ Impossible d\'accéder à la caméra. Vérifie les permissions dans ton navigateur !');
    }
  };

  // Prendre une photo
  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Miroir pour selfie
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(blob));
      
      // Arrêter la caméra
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      setShowCamera(false);
      setCurrentStep('preview');
    }, 'image/jpeg', 0.95);
  };

  // Fermer la caméra
  const handleCloseCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
    setCurrentStep('select');
  };

  // Upload depuis galerie
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setCurrentStep('preview');
    } else {
      alert('❌ Veuillez sélectionner une image valide');
    }
  };

  // Générer avec IA
  const handleGenerateAI = async () => {
    if (!selectedImage) {
      alert('❌ Sélectionne une image d\'abord');
      return;
    }

    if (!prompt.trim()) {
      alert('❌ Écris un prompt pour la génération IA');
      return;
    }

    setIsGenerating(true);
    setCurrentStep('generate');

    // TODO: Appel API IA ici
    // Pour l'instant, on simule
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedUrl(previewUrl); // On garde la même image pour l'instant
      setCurrentStep('edit');
    }, 3000);
  };

  // Ajouter une bulle de texte
  const handleAddBubble = () => {
    if (!bubbleText.trim()) return;

    const newBubble = {
      id: Date.now(),
      text: bubbleText,
      x: 50,
      y: 30 + (textBubbles.length * 15),
      fontSize: 20,
      color: '#ffffff',
      bgColor: '#000000'
    };

    setTextBubbles([...textBubbles, newBubble]);
    setBubbleText('');
    setShowTextInput(false);
  };

  // Supprimer une bulle
  const handleDeleteBubble = (id) => {
    setTextBubbles(textBubbles.filter(b => b.id !== id));
  };

  // Sauvegarder la création
  const handleSave = () => {
    // TODO: Enregistrer dans la galerie
    alert('✅ Création sauvegardée ! (Fonctionnalité à implémenter)');
    navigate('/gallery');
  };

  // Réinitialiser
  const handleReset = () => {
    setCurrentStep('select');
    setSelectedImage(null);
    setPreviewUrl(null);
    setGeneratedUrl(null);
    setPrompt('');
    setTextBubbles([]);
    setSelectedStyle('realistic');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-2 sm:p-4">
        
        {/* Conteneur principal - Format mobile vertical */}
        <div className="relative w-full max-w-[450px] h-full max-h-[85vh] bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl overflow-hidden border border-gray-800">
          
          {/* Header minimaliste */}
          <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/feed')}
                className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <span className="text-white font-semibold text-sm">Créer</span>
              
              <div className="w-9"></div>
            </div>
          </div>

          {/* Zone principale */}
          <div className="w-full h-full">
            
            {/* ÉTAPE: Sélection initiale */}
            {currentStep === 'select' && (
              <div className="w-full h-full flex flex-col items-center justify-center px-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                <div className="text-center mb-12">
                  <div className="text-5xl mb-3">✨</div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Commence ta création
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Capture ou importe une image
                  </p>
                </div>

                <div className="space-y-3 w-full max-w-xs">
                  {/* Bouton Caméra */}
                  <button
                    onClick={handleOpenCamera}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Prendre une photo
                  </button>

                  {/* Bouton Galerie */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 border border-white/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Galerie
                  </button>
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

            {/* ÉTAPE: Caméra active */}
            {currentStep === 'camera' && showCamera && (
              <div className="w-full h-full relative bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                  style={{ transform: 'scaleX(-1)' }}
                />
                
                {/* Overlay guides */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full border-2 border-white/20 rounded-3xl m-4"></div>
                </div>

                {/* Contrôles caméra */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8">
                  {/* Fermer */}
                  <button
                    onClick={handleCloseCamera}
                    className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/70 transition-all border border-white/20"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Capture */}
                  <button
                    onClick={handleTakePhoto}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl relative"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full"></div>
                  </button>

                  {/* Retourner caméra (placeholder) */}
                  <button className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/70 transition-all border border-white/20">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>

                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {/* ÉTAPE: Preview + Configuration IA */}
            {currentStep === 'preview' && previewUrl && (
              <div className="w-full h-full relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain bg-black"
                />

                {/* Boutons latéraux style TikTok */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 space-y-3 z-20">
                  {/* Style */}
                  <button
                    onClick={() => setShowStyleSelector(!showStyleSelector)}
                    className="w-11 h-11 bg-black/60 backdrop-blur-md rounded-full flex flex-col items-center justify-center hover:bg-black/80 transition-all border border-white/20"
                  >
                    <span className="text-lg">{aiStyles.find(s => s.id === selectedStyle)?.emoji}</span>
                    <span className="text-[8px] text-white/80 mt-0.5">Style</span>
                  </button>

                  {/* Prompt */}
                  <button
                    onClick={() => setShowPromptInput(!showPromptInput)}
                    className="w-11 h-11 bg-black/60 backdrop-blur-md rounded-full flex flex-col items-center justify-center hover:bg-black/80 transition-all border border-white/20"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="text-[8px] text-white/80 mt-0.5">Prompt</span>
                  </button>

                  {/* Reset */}
                  <button
                    onClick={handleReset}
                    className="w-11 h-11 bg-black/60 backdrop-blur-md rounded-full flex flex-col items-center justify-center hover:bg-black/80 transition-all border border-white/20"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-[8px] text-white/80 mt-0.5">Reset</span>
                  </button>
                </div>

                {/* Sélecteur de style */}
                {showStyleSelector && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl p-4 z-30 rounded-t-3xl border-t border-white/10">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-white font-semibold text-sm">Style IA</h3>
                      <button
                        onClick={() => setShowStyleSelector(false)}
                        className="text-white/60 hover:text-white"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {aiStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => {
                            setSelectedStyle(style.id);
                            setShowStyleSelector(false);
                          }}
                          className={`flex-shrink-0 w-20 p-3 rounded-2xl transition-all ${
                            selectedStyle === style.id
                              ? `bg-gradient-to-br ${style.color} text-white scale-105`
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          <div className="text-2xl mb-1">{style.emoji}</div>
                          <div className="text-[10px] font-medium">{style.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Prompt */}
                {showPromptInput && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl p-4 z-30 rounded-t-3xl border-t border-white/10">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-white font-semibold text-sm">Décris ce que tu veux</h3>
                      <button
                        onClick={() => setShowPromptInput(false)}
                        className="text-white/60 hover:text-white"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ex: un portrait style manga avec des couleurs vives..."
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 resize-none text-sm"
                      rows="3"
                    />
                    
                    <button
                      onClick={() => setShowPromptInput(false)}
                      className="w-full mt-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 rounded-xl font-semibold text-sm"
                    >
                      Valider
                    </button>
                  </div>
                )}

                {/* Bouton Générer */}
                <div className="absolute bottom-6 left-4 right-4 z-20">
                  <button
                    onClick={handleGenerateAI}
                    disabled={!prompt.trim()}
                    className={`w-full py-3.5 rounded-full font-bold text-sm transition-all shadow-2xl ${
                      prompt.trim()
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    ✨ Générer avec IA
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE: Génération en cours */}
            {currentStep === 'generate' && isGenerating && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/30 to-pink-900/30">
                <div className="relative mb-6">
                  <div className="w-24 h-24 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    ✨
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">
                  Génération IA en cours...
                </h3>
                <p className="text-gray-400 text-sm text-center px-8">
                  {aiStyles.find(s => s.id === selectedStyle)?.emoji} Style {aiStyles.find(s => s.id === selectedStyle)?.name}
                </p>
                <div className="mt-4 px-8 max-w-xs">
                  <p className="text-white/60 text-xs text-center italic">
                    "{prompt}"
                  </p>
                </div>
              </div>
            )}

            {/* ÉTAPE: Éditeur */}
            {currentStep === 'edit' && generatedUrl && (
              <div className="w-full h-full relative">
                <img
                  src={generatedUrl}
                  alt="Generated"
                  className="w-full h-full object-contain bg-black"
                />

                {/* Bulles de texte */}
                {textBubbles.map((bubble) => (
                  <div
                    key={bubble.id}
                    style={{
                      position: 'absolute',
                      left: `${bubble.x}%`,
                      top: `${bubble.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="group"
                  >
                    <div
                      className="px-4 py-2 rounded-2xl shadow-lg relative"
                      style={{
                        backgroundColor: bubble.bgColor,
                        color: bubble.color,
                        fontSize: `${bubble.fontSize}px`,
                      }}
                    >
                      {bubble.text}
                      
                      {/* Bouton supprimer */}
                      <button
                        onClick={() => handleDeleteBubble(bubble.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Boutons latéraux */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 space-y-3 z-20">
                  {/* Ajouter texte */}
                  <button
                    onClick={() => setShowTextInput(!showTextInput)}
                    className="w-11 h-11 bg-black/60 backdrop-blur-md rounded-full flex flex-col items-center justify-center hover:bg-black/80 transition-all border border-white/20"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <span className="text-[8px] text-white/80 mt-0.5">Texte</span>
                  </button>

                  {/* Reset */}
                  <button
                    onClick={handleReset}
                    className="w-11 h-11 bg-black/60 backdrop-blur-md rounded-full flex flex-col items-center justify-center hover:bg-black/80 transition-all border border-white/20"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-[8px] text-white/80 mt-0.5">Reset</span>
                  </button>
                </div>

                {/* Input texte */}
                {showTextInput && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl p-4 z-30 rounded-t-3xl border-t border-white/10">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-white font-semibold text-sm">Ajouter du texte</h3>
                      <button
                        onClick={() => setShowTextInput(false)}
                        className="text-white/60 hover:text-white"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={bubbleText}
                      onChange={(e) => setBubbleText(e.target.value)}
                      placeholder="Ton texte ici..."
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 text-sm mb-3"
                    />
                    
                    <button
                      onClick={handleAddBubble}
                      disabled={!bubbleText.trim()}
                      className={`w-full py-2.5 rounded-xl font-semibold text-sm ${
                        bubbleText.trim()
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Ajouter
                    </button>
                  </div>
                )}

                {/* Bouton Sauvegarder */}
                <div className="absolute bottom-6 left-4 right-4 z-20">
                  <button
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3.5 rounded-full font-bold text-sm transition-all shadow-2xl"
                  >
                    ✓ Sauvegarder
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Style pour cacher la scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default Editor;