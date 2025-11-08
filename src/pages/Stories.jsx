import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MobileHeader from '../components/MobileHeader';
import MobileNav from '../components/MobileNav';
import { storyService } from '../services/storyService';

function Stories() {
  const [stories, setStories] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showViewer, setShowViewer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const [allStories, userStories] = await Promise.all([
        storyService.getAllStories(),
        storyService.getMyStories()
      ]);
      setStories(allStories);
      setMyStories(userStories);
    } catch (error) {
      console.error('Erreur lors du chargement des stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const openStoryViewer = (story, index = 0) => {
    setSelectedStory(story);
    setCurrentStoryIndex(index);
    setShowViewer(true);
  };

  const closeStoryViewer = () => {
    setShowViewer(false);
    setSelectedStory(null);
  };

  const nextStory = () => {
    if (selectedStory && currentStoryIndex < selectedStory.items.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      // Passer à la story suivante
      const currentUserIndex = stories.findIndex(s => s.userId === selectedStory.userId);
      if (currentUserIndex < stories.length - 1) {
        const nextUserStory = stories[currentUserIndex + 1];
        setSelectedStory(nextUserStory);
        setCurrentStoryIndex(0);
      } else {
        closeStoryViewer();
      }
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      // Passer à la story précédente
      const currentUserIndex = stories.findIndex(s => s.userId === selectedStory.userId);
      if (currentUserIndex > 0) {
        const prevUserStory = stories[currentUserIndex - 1];
        setSelectedStory(prevUserStory);
        setCurrentStoryIndex(prevUserStory.items.length - 1);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title="Stories" />
        <div className="pt-16 pb-20 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Stories" />
      
      <div className="pt-16 pb-20">
        {/* Mes Stories */}
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Mes Stories</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {/* Bouton Créer Story */}
            <Link to="/create-story" className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl border-2 border-white shadow-lg">
                +
              </div>
              <p className="text-xs text-center mt-1 text-gray-600">Créer</p>
            </Link>
            
            {/* Mes Stories existantes */}
            {myStories.map((story) => (
              <div key={story.id} className="flex-shrink-0" onClick={() => openStoryViewer(story)}>
                <div className="w-16 h-16 rounded-full border-2 border-blue-500 p-0.5 cursor-pointer">
                  <img 
                    src={story.items[0]?.media_url} 
                    alt="Ma story"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <p className="text-xs text-center mt-1 text-gray-600 truncate w-16">Moi</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stories des amis */}
        <div className="px-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Stories des amis</h2>
          {stories.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-3xl mb-2">📖</div>
              <h3 className="text-base font-semibold text-gray-800 mb-1">
                Aucune story disponible
              </h3>
              <p className="text-gray-500 text-sm">
                Tes amis n'ont pas encore publié de stories
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stories.map((story) => (
                <div 
                  key={story.userId} 
                  className="bg-white rounded-xl shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openStoryViewer(story)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-blue-500 p-0.5">
                      <img 
                        src={story.items[0]?.media_url} 
                        alt={story.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{story.username}</h3>
                      <p className="text-xs text-gray-500">
                        {story.items.length} story{story.items.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(story.items[0]?.created_at).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Story Viewer */}
      {showViewer && selectedStory && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="relative w-full h-full max-w-md mx-auto">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4">
              <div className="flex items-center gap-2 mb-3">
                {/* Progress bars */}
                <div className="flex-1 flex gap-1">
                  {selectedStory.items.map((_, index) => (
                    <div key={index} className="flex-1 h-0.5 bg-gray-600 rounded">
                      <div 
                        className={`h-full bg-white rounded transition-all duration-300 ${
                          index < currentStoryIndex ? 'w-full' : 
                          index === currentStoryIndex ? 'w-full animate-pulse' : 'w-0'
                        }`}
                      />
                    </div>
                  ))}
                </div>
                <button onClick={closeStoryViewer} className="text-white text-xl">×</button>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {selectedStory.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-white font-medium text-sm">{selectedStory.username}</span>
                <span className="text-gray-300 text-xs">
                  {new Date(selectedStory.items[currentStoryIndex]?.created_at).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>

            {/* Story Content */}
            <div className="w-full h-full flex items-center justify-center">
              {selectedStory.items[currentStoryIndex]?.media_type === 'image' ? (
                <img 
                  src={selectedStory.items[currentStoryIndex]?.media_url}
                  alt="Story"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video 
                  src={selectedStory.items[currentStoryIndex]?.media_url}
                  className="max-w-full max-h-full object-contain"
                  autoPlay
                  muted
                />
              )}
            </div>

            {/* Navigation */}
            <div className="absolute inset-0 flex">
              <div className="w-1/2 h-full" onClick={prevStory}></div>
              <div className="w-1/2 h-full" onClick={nextStory}></div>
            </div>
          </div>
        </div>
      )}
      
      <MobileNav />
    </div>
  );
}

export default Stories;