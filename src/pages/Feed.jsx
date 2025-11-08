// src/pages/Feed.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import imageService from '../services/imageService';
import MobileHeader from '../components/MobileHeader';
import MobileNav from '../components/MobileNav';
import StoriesBar from '../components/StoriesBar';
import { maintainSession, refreshUserData } from '../utils/authUtils';

function Feed() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likesStatus, setLikesStatus] = useState({});
  const [commentsVisible, setCommentsVisible] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    loadPosts();
    
    // Maintenir la session active
    const sessionInterval = maintainSession();
    
    // Écouter les mises à jour des données utilisateur
    const handleUserRefresh = (event) => {
      setUser(event.detail);
    };
    
    window.addEventListener('userDataRefresh', handleUserRefresh);
    
    return () => {
      clearInterval(sessionInterval);
      window.removeEventListener('userDataRefresh', handleUserRefresh);
    };
  }, [navigate]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await imageService.getPublicImages();
      console.log('Response getPublicImages:', response);
      
      if (response.success && response.data) {
        const images = response.data.images || response.data || [];
        setPosts(images);
        
        // Charger les statuts de like
        const likesStatusTemp = {};
        for (const post of images) {
          try {
            const likeResponse = await imageService.checkLike(post.id);
            if (likeResponse.success && likeResponse.data) {
              likesStatusTemp[post.id] = likeResponse.data.liked;
            }
          } catch (error) {
            console.error(`Erreur vérification like pour post ${post.id}:`, error);
            likesStatusTemp[post.id] = false;
          }
        }
        setLikesStatus(likesStatusTemp);
      }
    } catch (error) {
      console.error('Erreur chargement posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await imageService.toggleLike(postId);
      
      if (response.success && response.data) {
        setLikesStatus(prev => ({
          ...prev,
          [postId]: response.data.liked
        }));

        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.id === postId) {
              const currentCount = post.likes_count || 0;
              const wasLiked = likesStatus[postId] || false;
              const newCount = response.data.liked 
                ? (wasLiked ? currentCount : currentCount + 1)
                : (wasLiked ? Math.max(0, currentCount - 1) : currentCount);
              
              return {
                ...post,
                likes_count: newCount
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error('Erreur like:', error);
    }
  };

  const toggleComments = async (postId) => {
    const isVisible = commentsVisible[postId];
    
    setCommentsVisible(prev => ({
      ...prev,
      [postId]: !isVisible
    }));

    if (!isVisible && !comments[postId]) {
      await loadComments(postId);
    }
  };

  const loadComments = async (postId) => {
    try {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      const response = await imageService.getComments(postId);
      
      if (response.success && response.data) {
        setComments(prev => ({
          ...prev,
          [postId]: response.data.comments || []
        }));
      }
    } catch (error) {
      console.error('Erreur chargement commentaires:', error);
      setComments(prev => ({ ...prev, [postId]: [] }));
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleAddComment = async (postId) => {
    const commentText = newComment[postId];
    
    if (!commentText || !commentText.trim()) {
      return;
    }

    try {
      const response = await imageService.addComment(postId, commentText);
      
      if (response.success) {
        setNewComment(prev => ({ ...prev, [postId]: '' }));
        await loadComments(postId);
        
        setPosts(prevPosts =>
          prevPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments_count: (post.comments_count || 0) + 1
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Supprimer ce commentaire ?')) {
      return;
    }

    try {
      const response = await imageService.deleteComment(commentId);
      
      if (response.success) {
        await loadComments(postId);
        
        setPosts(prevPosts =>
          prevPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments_count: Math.max(0, (post.comments_count || 0) - 1)
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error('Erreur suppression commentaire:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <MobileHeader title="📰 Feed" />

      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block w-64 p-4">
          <div className="bg-white rounded-xl shadow-sm p-4 sticky top-4">
            <Link to="/profile" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-800">{user.username}</p>
                <p className="text-sm text-gray-500">Voir le profil</p>
              </div>
            </Link>

            <nav className="space-y-1">
              <Link to="/feed" className="flex items-center gap-3 p-3 bg-blue-50 text-blue-600 rounded-lg font-medium">
                <span className="text-xl">🏠</span>
                <span>Feed</span>
              </Link>
              <Link to="/friends" className="flex items-center gap-3 p-3 hover:bg-gray-50 text-gray-700 rounded-lg">
                <span className="text-xl">👥</span>
                <span>Amis</span>
              </Link>
              <Link to="/messages" className="flex items-center gap-3 p-3 hover:bg-gray-50 text-gray-700 rounded-lg">
                <span className="text-xl">💬</span>
                <span>Messages</span>
              </Link>
              <Link to="/gallery" className="flex items-center gap-3 p-3 hover:bg-gray-50 text-gray-700 rounded-lg">
                <span className="text-xl">🖼️</span>
                <span>Ma galerie</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Feed Principal */}
        <div className="flex-1 max-w-2xl mx-auto p-4">
          {/* Stories Bar */}
          <StoriesBar />
          
          {/* Créer un post - Desktop */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm p-4 mb-6">
            <Link to="/create" className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-500 flex-1 text-lg">Créer une nouvelle image...</span>
              <span className="text-3xl">🎨</span>
            </Link>
          </div>

          {/* Posts */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-4xl mb-4">📰</div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">Aucun post</h3>
              <p className="text-gray-500 mb-4">Sois le premier à créer !</p>
              <Link to="/create" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
                Créer un post
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => {
                const isLiked = likesStatus[post.id] || false;
                const showComments = commentsVisible[post.id] || false;
                const postComments = comments[post.id] || [];
                const isLoadingComments = loadingComments[post.id] || false;
                
                return (
                  <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="p-4 flex items-center gap-3">
                      <Link to={`/user/${post.user_id}`}>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {post.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                      </Link>
                      <div className="flex-1">
                        <Link to={`/user/${post.user_id}`} className="font-bold text-gray-800 hover:underline">
                          {post.username || 'Utilisateur'}
                        </Link>
                        <p className="text-sm text-gray-500">Il y a quelques instants</p>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="relative w-full bg-gray-100">
                      <img
                        src={post.generated_image}
                        alt={post.title || 'Image'}
                        className="w-full object-cover"
                        style={{ maxHeight: '500px' }}
                        loading="lazy"
                      />
                      
                      {/* Audio si présent */}
                      {post.has_audio && post.audio_data && (
                        <div className="absolute top-4 right-4">
                          <div className="bg-black/70 backdrop-blur-sm rounded-full p-2 flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                              </svg>
                            </div>
                            <span className="text-white text-xs">{JSON.parse(post.audio_data).name}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 p-2 rounded-lg transition-all active:scale-95 ${
                              isLiked
                                ? 'text-red-500 bg-red-50'
                                : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                            }`}
                          >
                            <svg 
                              className="w-6 h-6" 
                              fill={isLiked ? "currentColor" : "none"} 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="font-semibold">{post.likes_count || 0}</span>
                          </button>

                          <button 
                            onClick={() => toggleComments(post.id)}
                            className="flex items-center gap-2 p-2 rounded-lg text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-all active:scale-95"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="font-semibold">{post.comments_count || 0}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm">{post.views_count || 0}</span>
                        </div>
                      </div>

                      {/* Titre et description */}
                      <div>
                        <p className="font-bold text-gray-800 mb-1">{post.title}</p>
                        {post.description && (
                          <p className="text-gray-600 text-sm">{post.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Commentaires */}
                    {showComments && (
                      <div className="border-t border-gray-200 bg-gray-50">
                        {isLoadingComments ? (
                          <div className="p-4 text-center">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          </div>
                        ) : (
                          <div className="p-4">
                            {postComments.length === 0 ? (
                              <p className="text-center text-gray-500 py-4 text-sm">Aucun commentaire</p>
                            ) : (
                              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                {postComments.map((comment) => (
                                  <div key={comment.id} className="flex gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                      {comment.username?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 bg-white rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="font-bold text-sm text-gray-800">{comment.username}</p>
                                        {comment.user_id === user.id && (
                                          <button
                                            onClick={() => handleDeleteComment(post.id, comment.id)}
                                            className="text-red-500 hover:text-red-700 text-xs p-1"
                                          >
                                            🗑️
                                          </button>
                                        )}
                                      </div>
                                      <p className="text-gray-700 text-sm">{comment.comment_text}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Ajouter commentaire */}
                            <div className="flex gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {user.username?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div className="flex-1 flex gap-2">
                                <input
                                  type="text"
                                  value={newComment[post.id] || ''}
                                  onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                      handleAddComment(post.id);
                                    }
                                  }}
                                  placeholder="Écris un commentaire..."
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 text-sm"
                                />
                                <button
                                  onClick={() => handleAddComment(post.id)}
                                  disabled={!newComment[post.id]?.trim()}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full font-medium transition-colors text-sm"
                                >
                                  💬
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Sidebar Droite - Desktop */}
        <div className="hidden xl:block w-64 p-4">
          <div className="bg-white rounded-xl shadow-sm p-4 sticky top-4">
            <h3 className="font-bold text-gray-800 mb-4">🔥 Tendances</h3>
            <div className="space-y-3">
              <div className="text-center py-8 text-gray-500 text-sm">
                <p>Fonctionnalités</p>
                <p>à venir bientôt !</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}

export default Feed;