// src/pages/ImageEditor.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import ToolPanel from '../components/editor/ToolPanel';
import StickerPanel from '../components/editor/StickerPanel';
import ColorPanel from '../components/editor/ColorPanel';

function ImageEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [tool, setTool] = useState('select'); // select, text, bubble, sticker, draw
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(24);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileTools, setShowMobileTools] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [isMultiTouch, setIsMultiTouch] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Détecter si on est sur mobile
    setIsMobile(window.innerWidth < 768);
    
    // Récupérer l'image depuis les props de navigation
    if (location.state?.imageUrl) {
      setImageUrl(location.state.imageUrl);
    } else {
      navigate('/create');
    }

    // Raccourcis clavier
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedElement) {
        deleteSelectedElement();
      } else if (e.key === 'v' || e.key === 'V') {
        setTool('select');
      } else if (e.key === 't' || e.key === 'T') {
        setTool('text');
      } else if (e.key === 'b' || e.key === 'B') {
        setTool('bubble');
      } else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, location.state, selectedElement]);

  useEffect(() => {
    if (imageUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Ajuster la taille du canvas
        const maxWidth = Math.min(800, window.innerWidth - 40);
        const maxHeight = Math.min(600, window.innerHeight - 200);
        
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        setCanvasSize({ width, height });
        
        // Dessiner l'image
        ctx.drawImage(img, 0, 0, width, height);
        redrawElements();
      };
      
      img.src = imageUrl;
    }
  }, [imageUrl]);

  const redrawElements = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Redessiner l'image de base
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Dessiner tous les éléments
      elements.forEach(element => {
        drawElement(ctx, element);
      });
    };
    img.src = imageUrl;
  };

  const drawElement = (ctx, element) => {
    ctx.save();
    
    switch (element.type) {
      case 'text':
        ctx.font = `${element.fontSize || 24}px Arial`;
        ctx.fillStyle = element.color || '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeText(element.text, element.x, element.y);
        ctx.fillText(element.text, element.x, element.y);
        break;
        
      case 'bubble':
        // Dessiner bulle de dialogue
        const padding = 10;
        const textWidth = ctx.measureText(element.text).width;
        const bubbleWidth = textWidth + padding * 2;
        const bubbleHeight = (element.fontSize || 24) + padding * 2;
        
        // Bulle
        ctx.fillStyle = element.backgroundColor || '#ffffff';
        ctx.strokeStyle = element.borderColor || '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(element.x - padding, element.y - bubbleHeight + padding, bubbleWidth, bubbleHeight, 10);
        ctx.fill();
        ctx.stroke();
        
        // Queue de la bulle
        ctx.beginPath();
        ctx.moveTo(element.x + bubbleWidth/4, element.y + padding);
        ctx.lineTo(element.x + bubbleWidth/4 - 10, element.y + padding + 15);
        ctx.lineTo(element.x + bubbleWidth/4 + 10, element.y + padding + 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Texte
        ctx.fillStyle = element.textColor || '#000000';
        ctx.font = `${element.fontSize || 18}px Arial`;
        ctx.fillText(element.text, element.x, element.y);
        break;
        
      case 'sticker':
        ctx.font = `${element.size || 40}px Arial`;
        ctx.fillText(element.emoji, element.x, element.y);
        break;
    }
    
    // Dessiner la sélection
    if (selectedElement && selectedElement.id === element.id) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(element.x - 5, element.y - 25, 100, 30);
      ctx.setLineDash([]);
    }
    
    ctx.restore();
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'text') {
      setShowTextInput(true);
      setDragStart({ x, y });
    } else if (tool === 'bubble') {
      setShowTextInput(true);
      setDragStart({ x, y });
    } else if (tool === 'select') {
      // Sélectionner un élément
      const clickedElement = elements.find(el => 
        x >= el.x - 10 && x <= el.x + 100 && 
        y >= el.y - 30 && y <= el.y + 10
      );
      setSelectedElement(clickedElement || null);
      redrawElements();
    }
  };

  const handleMouseDown = (e) => {
    if (tool === 'select' && selectedElement) {
      setIsDragging(true);
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      setDragStart({
        x: e.clientX - rect.left - selectedElement.x,
        y: e.clientY - rect.top - selectedElement.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && selectedElement) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragStart.x;
      const newY = e.clientY - rect.top - dragStart.y;
      
      setElements(elements.map(el => 
        el.id === selectedElement.id 
          ? { ...el, x: newX, y: newY }
          : el
      ));
      
      setSelectedElement({ ...selectedElement, x: newX, y: newY });
      redrawElements();
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const addTextElement = () => {
    if (!textInput.trim()) return;
    
    const newElement = {
      id: Date.now(),
      type: tool === 'bubble' ? 'bubble' : 'text',
      text: textInput,
      x: dragStart.x,
      y: dragStart.y,
      color: currentColor,
      fontSize: fontSize,
      backgroundColor: tool === 'bubble' ? '#ffffff' : undefined,
      textColor: tool === 'bubble' ? '#000000' : undefined,
      borderColor: tool === 'bubble' ? '#000000' : undefined
    };
    
    setElements([...elements, newElement]);
    setTextInput('');
    setShowTextInput(false);
    redrawElements();
  };

  const addSticker = (emoji) => {
    const newElement = {
      id: Date.now(),
      type: 'sticker',
      emoji: emoji,
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
      size: 40
    };
    
    setElements([...elements, newElement]);
    redrawElements();
  };

  const deleteSelectedElement = () => {
    if (selectedElement) {
      setElements(elements.filter(el => el.id !== selectedElement.id));
      setSelectedElement(null);
      redrawElements();
    }
  };

  // Historique (undo/redo)
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(elements)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [elements, history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
      redrawElements();
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
      redrawElements();
    }
  };

  // Gestion tactile
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touches = e.touches;
    
    if (touches.length === 1) {
      const touch = touches[0];
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      setTouchStart({ x, y });
      setIsMultiTouch(false);
      
      // Simuler un clic
      handleCanvasClick({ clientX: touch.clientX, clientY: touch.clientY });
    } else {
      setIsMultiTouch(true);
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && !isMultiTouch && selectedElement && touchStart) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const deltaX = x - touchStart.x;
      const deltaY = y - touchStart.y;
      
      setElements(elements.map(el => 
        el.id === selectedElement.id 
          ? { ...el, x: selectedElement.x + deltaX, y: selectedElement.y + deltaY }
          : el
      ));
      
      redrawElements();
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setTouchStart(null);
    setIsMultiTouch(false);
    if (elements !== history[historyIndex]) {
      saveToHistory();
    }
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = dataURL;
    link.click();
  };

  const stickers = ['😀', '😍', '🔥', '💯', '✨', '❤️', '👍', '🎉', '🚀', '⭐', '💪', '🎯'];
  const colors = ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

  if (!imageUrl) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between relative">
        <button
          onClick={() => navigate(-1)}
          className="text-white hover:text-gray-300 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {!isMobile && 'Retour'}
        </button>
        
        <h1 className="text-white font-bold text-lg">
          {isMobile ? '✏️' : '🎨 Éditeur d\'Image'}
        </h1>
        
        <div className="flex items-center gap-2">
          {/* Boutons d'historique */}
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Annuler (Ctrl+Z)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refaire (Ctrl+Y)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" />
            </svg>
          </button>
          
          <button
            onClick={saveImage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {!isMobile && 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-screen">
        {/* Barre d'outils - Desktop */}
        {!isMobile && (
          <div className="bg-gray-800 lg:w-80 overflow-y-auto">
            <ToolPanel 
              tool={tool} 
              setTool={setTool} 
              selectedElement={selectedElement} 
              onDeleteElement={deleteSelectedElement}
            />
            <div className="p-4">
              <StickerPanel onAddSticker={addSticker} />
              <ColorPanel 
                currentColor={currentColor}
                setCurrentColor={setCurrentColor}
                fontSize={fontSize}
                setFontSize={setFontSize}
              />
            </div>
          </div>
        )}

        {/* Zone de canvas */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="border border-gray-600 max-w-full max-h-full shadow-2xl rounded-lg"
            style={{ 
              cursor: tool === 'select' ? 'default' : 'crosshair',
              touchAction: 'none'
            }}
          />
          
          {/* Bouton outils mobile */}
          {isMobile && (
            <button
              onClick={() => setShowMobileTools(!showMobileTools)}
              className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Panel d'outils mobile */}
      {isMobile && showMobileTools && (
        <div className="fixed inset-0 bg-black/80 z-40 flex items-end">
          <div className="w-full bg-gray-800 rounded-t-2xl max-h-[70vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold text-lg">🛠️ Outils</h3>
                <button
                  onClick={() => setShowMobileTools(false)}
                  className="text-white hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <ToolPanel 
                tool={tool} 
                setTool={setTool} 
                selectedElement={selectedElement} 
                onDeleteElement={deleteSelectedElement}
              />
              <StickerPanel onAddSticker={(sticker) => {
                addSticker(sticker);
                setShowMobileTools(false);
              }} />
              <ColorPanel 
                currentColor={currentColor}
                setCurrentColor={setCurrentColor}
                fontSize={fontSize}
                setFontSize={setFontSize}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout de texte */}
      {showTextInput && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {tool === 'bubble' ? '💬 Ajouter une bulle' : '📝 Ajouter du texte'}
            </h3>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Tapez votre texte..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  addTextElement();
                  if (isMobile) setShowMobileTools(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                ✅ Ajouter
              </button>
              <button
                onClick={() => {
                  setShowTextInput(false);
                  setTextInput('');
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                ❌ Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageEditor;