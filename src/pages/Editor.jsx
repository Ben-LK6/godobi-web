// src/pages/Editor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as fabric from 'fabric';
import authService from '../services/authService';
import imageService from '../services/imageService';

function Editor() {
  const [user, setUser] = useState(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Options de style
  const [textOptions, setTextOptions] = useState({
    color: '#000000',
    fontSize: 24,
    fontFamily: 'Arial',
    bold: false,
    italic: false,
  });

  const [bubbleOptions, setBubbleOptions] = useState({
    fillColor: '#FFFFFF',
    strokeColor: '#000000',
    strokeWidth: 2,
  });

  // Polices disponibles
  const fonts = [
    'Arial',
    'Comic Sans MS',
    'Impact',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Trebuchet MS',
  ];

  // Palette de couleurs prédéfinies
  const colorPalette = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#FFD700', '#00CED1',
    '#FF1493', '#32CD32', '#FF6347', '#4B0082', '#F0E68C',
  ];

  // Formes de bulles disponibles
  const bubbleShapes = [
    { id: 'rect', name: 'Rectangle', icon: '▭' },
    { id: 'round', name: 'Arrondi', icon: '▢' },
    { id: 'ellipse', name: 'Ellipse', icon: '⬭' },
    { id: 'cloud', name: 'Nuage', icon: '☁️' },
    { id: 'speech-left', name: 'Dialogue ←', icon: '💬' },
    { id: 'speech-right', name: 'Dialogue →', icon: '💬' },
    { id: 'thought', name: 'Pensée', icon: '💭' },
    { id: 'shout', name: 'Cri', icon: '📢' },
  ];

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 900,
      height: 600,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true, // Important pour garder l'ordre des objets
    });

    setCanvas(fabricCanvas);

    // Écouter la sélection
    fabricCanvas.on('selection:created', (e) => {
      const obj = fabricCanvas.getActiveObject();
      
      // Ne pas sélectionner l'image de fond
      if (obj && obj.isBackgroundImage) {
        fabricCanvas.discardActiveObject();
        fabricCanvas.renderAll();
        return;
      }
      
      setSelectedObject(obj);
      updateOptionsFromObject(obj);
    });

    fabricCanvas.on('selection:updated', (e) => {
      const obj = fabricCanvas.getActiveObject();
      
      // Ne pas sélectionner l'image de fond
      if (obj && obj.isBackgroundImage) {
        fabricCanvas.discardActiveObject();
        fabricCanvas.renderAll();
        return;
      }
      
      setSelectedObject(obj);
      updateOptionsFromObject(obj);
    });

    fabricCanvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    // Empêcher l'image de fond de bouger
    fabricCanvas.on('object:moving', (e) => {
      if (e.target && e.target.isBackgroundImage) {
        e.target.set({
          left: e.target.originalLeft,
          top: e.target.originalTop,
        });
      }
    });

    return () => {
      fabricCanvas.dispose();
    };
  }, [navigate]);

  const updateOptionsFromObject = (obj) => {
    if (!obj) return;

    if (obj.type === 'i-text' || obj.type === 'text') {
      setTextOptions({
        color: obj.fill || '#000000',
        fontSize: obj.fontSize || 24,
        fontFamily: obj.fontFamily || 'Arial',
        bold: obj.fontWeight === 'bold',
        italic: obj.fontStyle === 'italic',
      });
    }

    if (obj.type === 'rect' || obj.type === 'ellipse' || obj.type === 'path' || obj.type === 'group') {
      setBubbleOptions({
        fillColor: obj.fill || '#FFFFFF',
        strokeColor: obj.stroke || '#000000',
        strokeWidth: obj.strokeWidth || 2,
      });
    }
  };

  const addCustomControls = (obj) => {
    obj.controls.deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetY: -16,
      offsetX: 16,
      cursorStyle: 'pointer',
      mouseUpHandler: deleteObject,
      render: renderDeleteIcon,
    });

    obj.controls.cloneControl = new fabric.Control({
      x: -0.5,
      y: -0.5,
      offsetY: -16,
      offsetX: -16,
      cursorStyle: 'pointer',
      mouseUpHandler: cloneObject,
      render: renderCloneIcon,
    });
  };

  const renderDeleteIcon = (ctx, left, top, styleOverride, fabricObject) => {
    const size = 24;
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×', 0, 0);
    ctx.restore();
  };

  const renderCloneIcon = (ctx, left, top, styleOverride, fabricObject) => {
    const size = 24;
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', 0, 0);
    ctx.restore();
  };

  const deleteObject = (eventData, transform) => {
    const target = transform.target;
    const canvas = target.canvas;
    canvas.remove(target);
    canvas.requestRenderAll();
  };

  const cloneObject = (eventData, transform) => {
    const target = transform.target;
    const canvas = target.canvas;
    
    target.clone((cloned) => {
      cloned.set({
        left: cloned.left + 20,
        top: cloned.top + 20,
      });
      addCustomControls(cloned);
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
    });
  };

  const addText = () => {
    if (!canvas) return;

    const text = new fabric.IText('Double-cliquez pour éditer', {
      left: 100,
      top: 100,
      fontSize: textOptions.fontSize,
      fill: textOptions.color,
      fontFamily: textOptions.fontFamily,
      fontWeight: textOptions.bold ? 'bold' : 'normal',
      fontStyle: textOptions.italic ? 'italic' : 'normal',
    });

    addCustomControls(text);
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const createBubble = (type) => {
    const options = {
      left: 200,
      top: 200,
      fill: bubbleOptions.fillColor,
      stroke: bubbleOptions.strokeColor,
      strokeWidth: bubbleOptions.strokeWidth,
    };

    let bubble;

    switch (type) {
      case 'rect':
        bubble = new fabric.Rect({
          ...options,
          width: 200,
          height: 100,
        });
        break;

      case 'round':
        bubble = new fabric.Rect({
          ...options,
          width: 200,
          height: 100,
          rx: 20,
          ry: 20,
        });
        break;

      case 'ellipse':
        bubble = new fabric.Ellipse({
          ...options,
          rx: 100,
          ry: 60,
        });
        break;

      case 'cloud':
        // Vraie forme de nuage
        const cloudPath = 'M 25,60 Q 25,25 55,25 Q 62,10 75,10 Q 90,10 95,25 Q 125,25 125,60 Q 125,85 95,85 Q 85,95 75,95 Q 62,95 55,85 Q 25,85 25,60 Z';
        bubble = new fabric.Path(cloudPath, {
          ...options,
          scaleX: 1.5,
          scaleY: 1.5,
        });
        break;

      case 'speech-left':
        // Vraie bulle de dialogue style BD pointant à gauche
        const speechLeftPath = 'M 30,10 L 180,10 Q 200,10 200,30 L 200,70 Q 200,90 180,90 L 50,90 L 20,110 L 40,90 L 30,90 Q 10,90 10,70 L 10,30 Q 10,10 30,10 Z';
        bubble = new fabric.Path(speechLeftPath, {
          ...options,
        });
        break;

      case 'speech-right':
        // Vraie bulle de dialogue style BD pointant à droite
        const speechRightPath = 'M 20,10 L 170,10 Q 190,10 190,30 L 190,70 Q 190,90 170,90 L 160,90 L 180,110 L 150,90 L 20,90 Q 0,90 0,70 L 0,30 Q 0,10 20,10 Z';
        bubble = new fabric.Path(speechRightPath, {
          ...options,
        });
        break;

      case 'thought':
        // Vraie bulle de pensée avec petites bulles
        const thoughtMain = new fabric.Ellipse({
          rx: 90,
          ry: 60,
          fill: options.fill,
          stroke: options.stroke,
          strokeWidth: options.strokeWidth,
          left: 0,
          top: 0,
        });
        const bubble1 = new fabric.Circle({
          radius: 15,
          fill: options.fill,
          stroke: options.stroke,
          strokeWidth: options.strokeWidth,
          left: -40,
          top: 55,
        });
        const bubble2 = new fabric.Circle({
          radius: 8,
          fill: options.fill,
          stroke: options.stroke,
          strokeWidth: options.strokeWidth,
          left: -60,
          top: 75,
        });
        bubble = new fabric.Group([thoughtMain, bubble1, bubble2], {
          left: options.left,
          top: options.top,
        });
        break;

      case 'shout':
        // Bulle d'explosion avec vrais pics
        const shoutPath = 'M 100,20 L 120,60 L 160,50 L 130,90 L 170,120 L 120,120 L 110,170 L 90,120 L 40,130 L 70,90 L 30,60 L 80,70 Z';
        bubble = new fabric.Path(shoutPath, {
          ...options,
        });
        break;

      default:
        bubble = new fabric.Rect({
          ...options,
          width: 200,
          height: 100,
        });
    }

    return bubble;
  };

  const addBubble = (type) => {
    if (!canvas) return;

    const bubble = createBubble(type);
    addCustomControls(bubble);
    canvas.add(bubble);
    canvas.setActiveObject(bubble);
    canvas.renderAll();
  };


const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const imgElement = new Image();
    imgElement.crossOrigin = 'anonymous';
    
    imgElement.onload = () => {
      // Créer l'image Fabric
      const fabricImg = new fabric.FabricImage(imgElement);
      
      // Calculer le scale pour remplir le canvas
      const scaleX = canvas.width / fabricImg.width;
      const scaleY = canvas.height / fabricImg.height;
      const scale = Math.min(scaleX, scaleY);
      
      fabricImg.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvas.width - fabricImg.width * scale) / 2,
        top: (canvas.height - fabricImg.height * scale) / 2,
      });

      // Définir comme image de fond (propriété native de Fabric)
      canvas.backgroundImage = fabricImg;
      canvas.renderAll();
      
      setBackgroundImage(fabricImg);
      console.log('Image de fond définie !');
      alert('✅ Image chargée avec succès !');
    };
    
    imgElement.onerror = () => {
      console.error('Erreur de chargement');
      alert('❌ Impossible de charger l\'image');
    };
    
    imgElement.src = event.target.result;
  };
  
  reader.readAsDataURL(file);
};
  const exportImage = () => {
    if (!canvas) return;
    
    canvas.discardActiveObject();
    canvas.renderAll();

    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
    });

    const link = document.createElement('a');
    link.download = `godobi-creation-${Date.now()}.png`;
    link.href = dataURL;
    link.click();

    alert('✅ Image téléchargée avec succès !');
  };

  const clearCanvas = () => {
    if (window.confirm('Es-tu sûr de vouloir tout effacer ?')) {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      setBackgroundImage(null);
      canvas.renderAll();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  // Sauvegarder la création
const saveCreation = async () => {
  if (!canvas) return;

  // Demander un titre
  const title = prompt('Donne un titre à ta création :');
  if (!title) return;

  const description = prompt('Description (optionnel) :');
  const isPublic = window.confirm('Rendre cette création publique ?');

  try {
    // Désélectionner tout
    canvas.discardActiveObject();
    canvas.renderAll();

    // Exporter l'image en base64
    const imageBase64 = canvas.toDataURL({
      format: 'png',
      quality: 1,
    });

    // Sauvegarder les données de l'éditeur (pour pouvoir ré-éditer plus tard)
    const editorData = {
      objects: canvas.toJSON(),
      backgroundImage: backgroundImage ? true : false
    };

    // Envoyer à l'API
    const response = await imageService.createImage({
      title: title,
      description: description || '',
      style_type: 'comic',
      generated_image: imageBase64,
      editor_data: editorData,
      is_public: isPublic
    });

    if (response.success) {
      alert('✅ Création sauvegardée avec succès !');
      console.log('Image ID:', response.data.id);
    }
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    alert('❌ Erreur lors de la sauvegarde : ' + (error.response?.data?.message || error.message));
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
<div className="flex items-center gap-3">
  <button
    onClick={saveCreation}
    className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-semibold transition-colors shadow-md flex items-center gap-2"
  >
    <span>💾</span>
    <span>Sauvegarder</span>
  </button>
   
  <button
    onClick={exportImage}
    className="bg-accent-500 hover:bg-accent-600 text-white px-5 py-2 rounded-lg font-semibold transition-colors shadow-md flex items-center gap-2"
  >
    <span>⬇️</span>
    <span>Télécharger</span>
  </button>
</div>

      {/* Interface principale */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Panneau gauche */}
        <div className="w-80 bg-white shadow-lg border-r overflow-y-auto">
          {/* Onglets */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'upload'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📷 Image
            </button>
            <button
              onClick={() => setActiveTab('bubbles')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'bubbles'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💬 Bulles
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'text'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✏️ Texte
            </button>
          </div>

          <div className="p-4">
            {/* Onglet Upload */}
            {activeTab === 'upload' && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Importer une image
                </h3>
                <label className="block w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-4 rounded-lg font-semibold cursor-pointer transition-colors">
                  <span className="text-2xl block mb-2">📷</span>
                  Choisir une image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  JPG, PNG jusqu'à 10 MB
                </p>
              </div>
            )}

            {/* Onglet Bulles */}
            {activeTab === 'bubbles' && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Formes de bulles
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {bubbleShapes.map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => addBubble(shape.id)}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 hover:from-primary-50 hover:to-primary-100 border-2 border-gray-300 hover:border-primary-500 rounded-xl p-4 transition-all transform hover:scale-105 shadow-sm hover:shadow-md"
                    >
                      <div className="text-3xl mb-2">{shape.icon}</div>
                      <div className="text-xs font-bold text-gray-700">
                        {shape.name}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Options de bulle */}
                {selectedObject && !selectedObject.isBackgroundImage && (selectedObject.type === 'rect' || selectedObject.type === 'ellipse' || selectedObject.type === 'path' || selectedObject.type === 'group') && (
                  <div className="border-t pt-4">
                    <h4 className="font-bold text-gray-700 mb-3">🎨 Style de la bulle</h4>
                    
                    <div className="space-y-4">
                      {/* Couleur de fond avec palette */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Couleur de fond
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {colorPalette.map((color) => (
                            <button
                              key={color}
                              onClick={() => {
                                setBubbleOptions({ ...bubbleOptions, fillColor: color });
                                if (selectedObject) {
                                  selectedObject.set('fill', color);
                                  canvas.renderAll();
                                }
                              }}
                              className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                                bubbleOptions.fillColor === color ? 'border-primary-600 ring-2 ring-primary-300' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Couleur du contour avec palette */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Couleur du contour
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {colorPalette.map((color) => (
                            <button
                              key={color}
                              onClick={() => {
                                setBubbleOptions({ ...bubbleOptions, strokeColor: color });
                                if (selectedObject) {
                                  selectedObject.set('stroke', color);
                                  canvas.renderAll();
                                }
                              }}
                              className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                                bubbleOptions.strokeColor === color ? 'border-primary-600 ring-2 ring-primary-300' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                          Épaisseur: {bubbleOptions.strokeWidth}px
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={bubbleOptions.strokeWidth}
                          onChange={(e) => {
                            const width = parseInt(e.target.value);
                            setBubbleOptions({ ...bubbleOptions, strokeWidth: width });
                            if (selectedObject) {
                              selectedObject.set('strokeWidth', width);
                              canvas.renderAll();
                            }
                          }}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Onglet Texte */}
            {activeTab === 'text' && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Ajouter du texte
                </h3>
                
                <button
                  onClick={addText}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-lg font-semibold transition-colors mb-6 shadow-md"
                >
                  <span className="text-2xl block mb-2">✏️</span>
                  Ajouter du texte
                </button>

                {/* Options de texte */}
                {selectedObject && !selectedObject.isBackgroundImage && (selectedObject.type === 'i-text' || selectedObject.type === 'text') && (
                  <div className="border-t pt-4">
                    <h4 className="font-bold text-gray-700 mb-3">🎨 Style du texte</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                          Police
                        </label>
                        <select
                          value={textOptions.fontFamily}
                          onChange={(e) => {
                            setTextOptions({ ...textOptions, fontFamily: e.target.value });
                            if (selectedObject) {
                              selectedObject.set('fontFamily', e.target.value);
                              canvas.renderAll();
                            }
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                        >
                          {fonts.map((font) => (
                            <option key={font} value={font} style={{ fontFamily: font }}>
                              {font}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Couleur avec palette */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Couleur du texte
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {colorPalette.map((color) => (
                            <button
                              key={color}
                              onClick={() => {
                                setTextOptions({ ...textOptions, color: color });
                                if (selectedObject) {
                                  selectedObject.set('fill', color);
                                  canvas.renderAll();
                                }
                              }}
                              className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                                textOptions.color === color ? 'border-primary-600 ring-2 ring-primary-300' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                          Taille: {textOptions.fontSize}px
                        </label>
                        <input
                          type="range"
                          min="12"
                          max="120"
                          value={textOptions.fontSize}
                          onChange={(e) => {
                            const size = parseInt(e.target.value);
                            setTextOptions({ ...textOptions, fontSize: size });
                            if (selectedObject) {
                              selectedObject.set('fontSize', size);
                              canvas.renderAll();
                            }
                          }}
                          className="w-full"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newBold = !textOptions.bold;
                            setTextOptions({ ...textOptions, bold: newBold });
                            if (selectedObject) {
                              selectedObject.set('fontWeight', newBold ? 'bold' : 'normal');
                              canvas.renderAll();
                            }
                          }}
                          className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                            textOptions.bold
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          B
                        </button>
                        <button
                          onClick={() => {
                            const newItalic = !textOptions.italic;
                            setTextOptions({ ...textOptions, italic: newItalic });
                            if (selectedObject) {
                              selectedObject.set('fontStyle', newItalic ? 'italic' : 'normal');
                              canvas.renderAll();
                            }
                          }}
                          className={`flex-1 py-2 rounded-lg italic transition-all ${
                            textOptions.italic
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          I
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions globales */}
            <div className="border-t pt-4 mt-4 space-y-2">
              <button
                onClick={clearCanvas}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors shadow-md"
              >
                🗑️ Tout effacer
              </button>
            </div>
          </div>
        </div>

        {/* Zone canvas centrale */}
        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="bg-white rounded-xl shadow-2xl p-6">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Panneau droit */}
        <div className="w-64 bg-white shadow-lg border-l p-4 overflow-y-auto">
          <h3 className="text-lg font-heading font-bold text-gray-800 mb-4">
            💡 Guide rapide
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
              <p className="font-semibold text-blue-700 mb-1">📷 Image de fond</p>
              <p className="text-gray-600">L'image reste en arrière-plan et ne bouge plus</p>
            </div>

            <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
              <p className="font-semibold text-green-700 mb-1">💬 Bulles</p>
              <p className="text-gray-600">Clique sur une forme pour l'ajouter au canvas</p>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
              <p className="font-semibold text-purple-700 mb-1">✏️ Texte</p>
              <p className="text-gray-600">Double-clique sur le texte pour l'éditer</p>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
              <p className="font-semibold text-yellow-700 mb-1">🎨 Couleurs</p>
              <p className="text-gray-600">Palette de 20 couleurs disponibles</p>
            </div>

            <div className="bg-pink-50 p-3 rounded-lg border-l-4 border-pink-500">
              <p className="font-semibold text-pink-700 mb-1">🎯 Contrôles</p>
              <p className="text-gray-600">Rouge = Supprimer<br/>Vert = Dupliquer</p>
            </div>

            <div className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-500">
              <p className="font-semibold text-indigo-700 mb-1">💾 Export</p>
              <p className="text-gray-600">Télécharge en PNG haute qualité</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Editor;