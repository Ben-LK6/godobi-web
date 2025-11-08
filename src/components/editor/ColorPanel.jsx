// src/components/editor/ColorPanel.jsx
import React, { useState } from 'react';

function ColorPanel({ currentColor, setCurrentColor, fontSize, setFontSize }) {
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [customColor, setCustomColor] = useState('#ffffff');

  const presetColors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#ffa500', '#800080', '#ffc0cb', '#a52a2a', '#808080', '#008000', '#000080', '#800000',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'
  ];

  const gradientColors = [
    'linear-gradient(45deg, #ff6b6b, #ffa500)',
    'linear-gradient(45deg, #4ecdc4, #45b7d1)',
    'linear-gradient(45deg, #96ceb4, #ffeaa7)',
    'linear-gradient(45deg, #dda0dd, #ff6b6b)',
    'linear-gradient(45deg, #98d8c8, #4ecdc4)',
    'linear-gradient(45deg, #f7dc6f, #ffa500)'
  ];

  return (
    <div className="mb-6">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        🎨 Couleurs & Style
      </h3>
      
      {/* Couleurs prédéfinies */}
      <div className="mb-4">
        <h4 className="text-gray-300 text-sm mb-2">Couleurs de base</h4>
        <div className="grid grid-cols-8 gap-2">
          {presetColors.map((color, i) => (
            <button
              key={i}
              onClick={() => setCurrentColor(color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                currentColor === color ? 'border-white shadow-lg' : 'border-gray-600'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Couleurs dégradées */}
      <div className="mb-4">
        <h4 className="text-gray-300 text-sm mb-2">Dégradés</h4>
        <div className="grid grid-cols-3 gap-2">
          {gradientColors.map((gradient, i) => (
            <button
              key={i}
              onClick={() => setCurrentColor(gradient)}
              className={`w-full h-8 rounded-lg border-2 transition-all hover:scale-105 ${
                currentColor === gradient ? 'border-white shadow-lg' : 'border-gray-600'
              }`}
              style={{ background: gradient }}
            />
          ))}
        </div>
      </div>

      {/* Sélecteur de couleur personnalisé */}
      <div className="mb-4">
        <button
          onClick={() => setShowCustomColor(!showCustomColor)}
          className="w-full p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z" />
          </svg>
          Couleur personnalisée
        </button>
        
        {showCustomColor && (
          <div className="mt-2 p-3 bg-gray-700 rounded-lg">
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                setCurrentColor(e.target.value);
              }}
              className="w-full h-10 rounded cursor-pointer"
            />
            <div className="text-gray-300 text-xs mt-2">{customColor}</div>
          </div>
        )}
      </div>

      {/* Taille de police */}
      <div className="mb-4">
        <h4 className="text-gray-300 text-sm mb-2">Taille du texte</h4>
        <div className="space-y-2">
          <input
            type="range"
            min="12"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>12px</span>
            <span className="text-white font-medium">{fontSize}px</span>
            <span>72px</span>
          </div>
        </div>
      </div>

      {/* Tailles prédéfinies */}
      <div className="mb-4">
        <h4 className="text-gray-300 text-sm mb-2">Tailles rapides</h4>
        <div className="grid grid-cols-4 gap-2">
          {[16, 24, 36, 48].map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              className={`p-2 rounded-lg text-xs transition-all ${
                fontSize === size
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {size}px
            </button>
          ))}
        </div>
      </div>

      {/* Aperçu */}
      <div className="p-3 bg-gray-700 rounded-lg">
        <h4 className="text-gray-300 text-sm mb-2">Aperçu</h4>
        <div
          className="text-center p-2 rounded"
          style={{ 
            color: currentColor.startsWith('linear-gradient') ? '#ffffff' : currentColor,
            background: currentColor.startsWith('linear-gradient') ? currentColor : 'transparent',
            fontSize: `${Math.min(fontSize, 24)}px`,
            WebkitBackgroundClip: currentColor.startsWith('linear-gradient') ? 'text' : 'initial',
            WebkitTextFillColor: currentColor.startsWith('linear-gradient') ? 'transparent' : currentColor
          }}
        >
          Exemple de texte
        </div>
      </div>
    </div>
  );
}

export default ColorPanel;