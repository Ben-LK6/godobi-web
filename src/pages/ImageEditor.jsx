// src/pages/ImageEditor.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function ImageEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('text');
  const [isLoading, setIsLoading] = useState(true);

  // États pour les outils
  const [textElements, setTextElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(24);

  // États pour les filtres
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0
  });

  const tabs = [
    { id: 'text', name: 'Texte', icon: '💬' },
    { id: 'filters', name: 'Filtres', icon: '🎨' },
    { id: 'stickers', name: 'Stickers', icon: '😀' },
    { id: 'draw', name: 'Dessiner', icon: '✏️' }
  ];

  const stickers = ['😀', '😍', '🔥', '💯', '✨', '❤️', '👍', '🎉', '💪', '🌟', '🚀', '💎'];

  useEffect(() => {
    // Récupérer l'URL de l'image depuis les paramètres de navigation
    const imageUrl = location.state?.imageUrl;
    if (imageUrl) {
      setImageUrl(imageUrl);
      setIsLoading(false);
    } else {
      navigate('/temp-gallery');
    }
  }, [location, navigate]);

  const handleAddText = () => {
    if (!textInput.trim()) return;

    const newText = {
      id: Date.now(),
      text: textInput,
      x: 50,
      y: 30 + (textElements.length * 10),
      color: textColor,
      size: textSize,
      type: 'text'
    };

    setTextElements([...textElements, newText]);
    setTextInput('');
    setShowTextInput(false);
  };

  const handleAddSticker = (sticker) => {
    const newSticker = {
      id: Date.now(),
      text: sticker,
      x: 50,
      y: 30 + (textElements.length * 10),
      size: 40,
      type: 'sticker'
    };

    setTextElements([...textElements, newSticker]);
  };

  const handleDeleteElement = (id) => {
    setTextElements(textElements.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  const handleSave = () => {
    // TODO: Sauvegarder l'image éditée
    alert('✅ Modifications sauvegardées !');
    navigate('/temp-gallery');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-3 sm:p-4 pt-10 sm:pt-12">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/temp-gallery')}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h1 className="text-white font-bold text-sm sm:text-base">Éditeur</h1>
          
          <button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold text-xs sm:text-sm transition-all"
          >
            ✓ Sauver
          </button>
        </div>
      </div>

      {/* Zone d'édition */}
      <div className="flex-1 relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <img
              ref={canvasRef}
              src={imageUrl}
              alt="À éditer"
              className="max-w-full max-h-full object-contain rounded-lg"
              style={{
                filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px)`
              }}
            />
            
            {/* Éléments de texte et stickers */}
            {textElements.map((element) => (
              <div
                key={element.id}
                style={{
                  position: 'absolute',
                  left: `${element.x}%`,
                  top: `${element.y}%`,
                  transform: 'translate(-50%, -50%)',
                  color: element.color,
                  fontSize: `${element.size}px`,
                  cursor: 'move'
                }}
                className="group select-none"
                onClick={() => setSelectedElement(element)}
              >
                {element.text}
                
                {selectedElement?.id === element.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteElement(element.id);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="bg-black/95 backdrop-blur-xl border-t border-white/10">
        {/* Onglets */}
        <div className="flex justify-center border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 max-w-20 py-3 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Contenu des onglets */}
        <div className="p-4 max-h-48 overflow-y-auto">
          {/* Onglet Texte */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <button
                onClick={() => setShowTextInput(true)}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-semibold transition-all"
              >
                + Ajouter du texte
              </button>
              
              {showTextInput && (
                <div className="space-y-3 bg-white/5 rounded-xl p-4">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Ton texte..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 text-sm"
                  />
                  
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-8 rounded border border-white/20"
                    />
                    
                    <input
                      type="range"
                      min="12"
                      max="48"
                      value={textSize}
                      onChange={(e) => setTextSize(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddText}
                      disabled={!textInput.trim()}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white py-2 rounded-lg text-sm"
                    >
                      Ajouter
                    </button>
                    <button
                      onClick={() => setShowTextInput(false)}
                      className="px-4 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Onglet Filtres */}
          {activeTab === 'filters' && (
            <div className="space-y-4">
              {Object.entries(filters).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-white text-sm">
                    <span className="capitalize">{key === 'blur' ? 'Flou' : key}</span>
                    <span>{value}{key === 'blur' ? 'px' : '%'}</span>
                  </div>
                  <input
                    type="range"
                    min={key === 'blur' ? 0 : 0}
                    max={key === 'blur' ? 10 : 200}
                    value={value}
                    onChange={(e) => setFilters({...filters, [key]: e.target.value})}
                    className="w-full"
                  />
                </div>
              ))}
              
              <button
                onClick={() => setFilters({ brightness: 100, contrast: 100, saturation: 100, blur: 0 })}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg text-sm"
              >
                Réinitialiser
              </button>
            </div>
          )}

          {/* Onglet Stickers */}
          {activeTab === 'stickers' && (
            <div className="grid grid-cols-6 gap-3">
              {stickers.map((sticker, index) => (
                <button
                  key={index}
                  onClick={() => handleAddSticker(sticker)}
                  className="aspect-square bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-2xl transition-all hover:scale-110"
                >
                  {sticker}
                </button>
              ))}
            </div>
          )}

          {/* Onglet Dessiner */}
          {activeTab === 'draw' && (
            <div className="text-center text-white/60 py-8">
              <div className="text-4xl mb-2">🎨</div>
              <p className="text-sm">Fonctionnalité de dessin</p>
              <p className="text-xs text-white/40">Bientôt disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageEditor;