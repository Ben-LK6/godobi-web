// src/components/editor/StickerPanel.jsx
import React, { useState } from 'react';

function StickerPanel({ onAddSticker }) {
  const [activeCategory, setActiveCategory] = useState('emotions');

  const stickerCategories = {
    emotions: {
      name: '😀 Émotions',
      stickers: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳']
    },
    gestures: {
      name: '👍 Gestes',
      stickers: ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏']
    },
    objects: {
      name: '🎯 Objets',
      stickers: ['🔥', '💯', '✨', '⭐', '🌟', '💫', '⚡', '💥', '💢', '💨', '💦', '💤', '🎯', '🎪', '🎨', '🎭', '🎪', '🎡', '🎢', '🎠', '🎳', '🎮', '🕹️', '🎲']
    },
    symbols: {
      name: '💎 Symboles',
      stickers: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️']
    },
    arrows: {
      name: '➡️ Flèches',
      stickers: ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️', '↕️', '↔️', '↩️', '↪️', '⤴️', '⤵️', '🔃', '🔄', '🔙', '🔚', '🔛', '🔜', '🔝']
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        🎭 Stickers & Émojis
      </h3>
      
      {/* Catégories */}
      <div className="flex flex-wrap gap-1 mb-3">
        {Object.entries(stickerCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              activeCategory === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {category.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Stickers de la catégorie active */}
      <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
        {stickerCategories[activeCategory].stickers.map((sticker, i) => (
          <button
            key={i}
            onClick={() => onAddSticker(sticker)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xl transition-all hover:scale-110 active:scale-95"
            title={`Ajouter ${sticker}`}
          >
            {sticker}
          </button>
        ))}
      </div>

      {/* Stickers personnalisés */}
      <div className="mt-4 p-3 bg-gray-700 rounded-lg">
        <h4 className="text-white text-sm font-medium mb-2">✨ Stickers Spéciaux</h4>
        <div className="grid grid-cols-4 gap-2">
          {['🚀', '💎', '🏆', '🎉', '🔥', '💯', '⚡', '✨'].map((sticker, i) => (
            <button
              key={i}
              onClick={() => onAddSticker(sticker)}
              className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-xl transition-all hover:scale-110 active:scale-95"
            >
              {sticker}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StickerPanel;