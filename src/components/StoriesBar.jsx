import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storyService } from '../services/storyService';

function StoriesBar() {
  const [stories, setStories] = useState([]);
  const [myStories, setMyStories] = useState([]);
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
      setStories(allStories.slice(0, 8)); // Limiter à 8 stories
      setMyStories(userStories);
    } catch (error) {
      console.error('Erreur lors du chargement des stories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex gap-3 overflow-x-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-12 h-2 bg-gray-200 rounded mt-2 mx-auto animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {/* Ma Story */}
        <Link to="/create-story" className="flex-shrink-0 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl border-2 border-white shadow-lg">
            +
          </div>
          <p className="text-xs mt-1 text-gray-600 truncate w-16">Créer</p>
        </Link>

        {/* Mes Stories existantes */}
        {myStories.map((story) => (
          <Link key={story.id} to="/stories" className="flex-shrink-0 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-blue-500 p-0.5">
              <img 
                src={story.items[0]?.media_url} 
                alt="Ma story"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <p className="text-xs mt-1 text-gray-600 truncate w-16">Moi</p>
          </Link>
        ))}

        {/* Stories des amis */}
        {stories.map((story) => (
          <Link key={story.userId} to="/stories" className="flex-shrink-0 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-gray-300 p-0.5">
              <img 
                src={story.items[0]?.media_url} 
                alt={story.username}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <p className="text-xs mt-1 text-gray-600 truncate w-16">{story.username}</p>
          </Link>
        ))}

        {/* Voir toutes les stories */}
        {stories.length > 0 && (
          <Link to="/stories" className="flex-shrink-0 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-xl">
              →
            </div>
            <p className="text-xs mt-1 text-gray-600 truncate w-16">Voir tout</p>
          </Link>
        )}
      </div>
    </div>
  );
}

export default StoriesBar;