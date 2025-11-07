// src/components/AudioController.jsx
import React from 'react';
import audioService from '../services/audioService';

function AudioController({ 
  selectedMusic, 
  isPlaying, 
  audioPreview, 
  onPlayPause, 
  onRemove,
  size = 'normal', // 'small', 'normal', 'large'
  position = 'top-right' // 'top-right', 'bottom-right', 'bottom-left'
}) {
  if (!selectedMusic) return null;

  const sizeClasses = {
    small: {
      container: 'p-1.5',
      icon: 'w-5 h-5',
      iconInner: 'w-2.5 h-2.5',
      button: 'w-4 h-4',
      buttonInner: 'w-2 h-2',
      text: 'text-[10px] max-w-12'
    },
    normal: {
      container: 'p-2',
      icon: 'w-8 h-8',
      iconInner: 'w-4 h-4',
      button: 'w-6 h-6',
      buttonInner: 'w-3 h-3',
      text: 'text-xs max-w-20'
    },
    large: {
      container: 'p-3',
      icon: 'w-10 h-10',
      iconInner: 'w-5 h-5',
      button: 'w-8 h-8',
      buttonInner: 'w-4 h-4',
      text: 'text-sm max-w-24'
    }
  };

  const positionClasses = {
    'top-right': 'absolute top-4 right-4',
    'bottom-right': 'absolute bottom-4 right-4',
    'bottom-left': 'absolute bottom-4 left-4'
  };

  const classes = sizeClasses[size];

  const handlePlayPause = (e) => {
    e.stopPropagation();
    if (isPlaying && audioPreview?.src === selectedMusic.url) {
      audioService.stopPreview();
      onPlayPause(false, null);
    } else {
      onPlayPause(true, selectedMusic);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    audioService.stopPreview();
    onPlayPause(false, null);
    onRemove();
  };

  return (
    <div className={positionClasses[position]}>
      <div className={`bg-black/80 backdrop-blur-md rounded-full ${classes.container} flex items-center gap-2 border border-white/20`}>
        {/* Icône musique */}
        <div className={`${classes.icon} bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center`}>
          <svg className={`${classes.iconInner} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        
        {/* Nom de la musique */}
        <div className={`text-white ${classes.text} truncate`}>
          {selectedMusic.name}
        </div>
        
        {/* Bouton Play/Pause */}
        <button
          onClick={handlePlayPause}
          className={`${classes.button} bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all`}
        >
          {isPlaying && audioPreview?.src === selectedMusic.url ? (
            <svg className={`${classes.buttonInner} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
            </svg>
          ) : (
            <svg className={`${classes.buttonInner} text-white`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
        
        {/* Bouton Supprimer */}
        <button
          onClick={handleRemove}
          className={`${classes.button} bg-red-500/20 hover:bg-red-500/30 rounded-full flex items-center justify-center transition-all`}
        >
          <svg className={`${classes.buttonInner} text-red-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default AudioController;