// src/pages/AudioTestPage.jsx
import React from 'react';
import AudioTest from '../components/AudioTest';

function AudioTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Test Audio System</h1>
        
        <div className="grid gap-6">
          <AudioTest />
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4">Instructions de test</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Sélectionnez un fichier audio (MP3, WAV, OGG, M4A, AAC)</li>
              <li>Vérifiez que les métadonnées s'affichent correctement</li>
              <li>Testez la preview audio (10 secondes max)</li>
              <li>Vérifiez la console pour les logs détaillés</li>
            </ol>
            
            <div className="mt-4 p-4 bg-yellow-50 rounded">
              <h4 className="font-semibold text-yellow-800">Formats supportés :</h4>
              <p className="text-yellow-700 text-sm">MP3, WAV, OGG, M4A, AAC (max 10MB)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AudioTestPage;