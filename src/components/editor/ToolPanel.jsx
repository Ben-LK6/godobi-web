// src/components/editor/ToolPanel.jsx
import React from 'react';

function ToolPanel({ tool, setTool, selectedElement, onDeleteElement }) {
  const tools = [
    { id: 'select', name: 'Sélectionner', icon: '👆', description: 'Sélectionner et déplacer' },
    { id: 'text', name: 'Texte', icon: 'Aa', description: 'Ajouter du texte' },
    { id: 'bubble', name: 'Bulle', icon: '💬', description: 'Bulle de dialogue' },
    { id: 'draw', name: 'Dessiner', icon: '✏️', description: 'Dessiner à main levée' },
    { id: 'shape', name: 'Formes', icon: '⬜', description: 'Formes géométriques' },
    { id: 'filter', name: 'Filtres', icon: '🎨', description: 'Effets et filtres' }
  ];

  return (
    <div className="bg-gray-800 p-4 lg:w-64 overflow-y-auto">
      {/* Outils principaux */}
      <div className="mb-6">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          🛠️ Outils
        </h3>
        <div className="space-y-2">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
                tool === t.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <div className="text-left">
                <div className="font-medium">{t.name}</div>
                <div className="text-xs opacity-75">{t.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Actions sur l'élément sélectionné */}
      {selectedElement && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            ✨ Élément sélectionné
          </h3>
          <div className="text-gray-300 text-sm mb-3">
            Type: {selectedElement.type}
          </div>
          <div className="space-y-2">
            <button
              onClick={onDeleteElement}
              className="w-full p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer
            </button>
            <button
              className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier
            </button>
          </div>
        </div>
      )}

      {/* Raccourcis clavier */}
      <div className="text-gray-400 text-xs">
        <h4 className="font-semibold mb-2">⌨️ Raccourcis</h4>
        <div className="space-y-1">
          <div>V - Sélectionner</div>
          <div>T - Texte</div>
          <div>B - Bulle</div>
          <div>Del - Supprimer</div>
          <div>Ctrl+Z - Annuler</div>
        </div>
      </div>
    </div>
  );
}

export default ToolPanel;