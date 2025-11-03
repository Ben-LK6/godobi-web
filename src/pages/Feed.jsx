// src/pages/Feed.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import imageService from '../services/imageService';

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
  }, [navigate]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await imageService.getPublicImages();
      if (response.success) {
        setPosts(response.data.images);
        
        const likesStatusTemp = {};
        for (const post of response.data.images) {
          try {
            const likeResponse = await imageService.checkLike(post.id);
            if (likeResponse.success) {
              likesStatusTemp[post.id] = likeResponse.data.liked;
            }
          } catch (error) {
            console.error(`Erreur vérification like pour post ${post.id}:`, error);
          }
        }
        setLikesStatus(likesStatusTemp);
      }
    } catch (error) {
      console.error('Erreur chargement posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await imageService.toggleLike(postId);
      
      if (response.success) {
        setLikesStatus(prev => ({
          ...prev,
          [postId]: response.data.liked
        }));

        setPosts(prevPosts => 
          prevPosts.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                likes_count: response.data.liked 
                  ? post.likes_count + 1 
                  : post.likes_count - 1
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
      
      if (response.success) {
        setComments(prev => ({
          ...prev,
          [postId]: response.data.comments
        }));
      }
    } catch (error) {
      console.error('Erreur chargement commentaires:', error);
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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Gauche */}
          <div className="col-span-3 hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-20">
              <Link to="/profile" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{user.username}</p>
                  <p className="text-sm text-gray-500">Voir le profil</p>
                </div>
              </Link>

              <div className="border-t border-gray-200 my-4"></div>

              <nav className="space-y-2">
                <Link to="/feed" className="flex items-center gap-3 p-3 bg-blue-50 text-blue-600 rounded-lg font-semibold">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Feed</span>
                </Link>

                <Link to="/friends" className="flex items-center gap-3 p-3 hover:bg-gray-50 text-gray-700 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Amis</span>
                </Link>

                <Link to="/messages" className="flex items-center gap-3 p-3 hover:bg-gray-50 text-gray-700 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Messages</span>
                </Link>

                <Link to="/gallery" className="flex items-center gap-3 p-3 hover:bg-gray-50 text-gray-700 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Ma galerie</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Feed Central */}
          <div className="col-span-12 lg:col-span-6">
            {/* Créer un post */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <Link to="/editor" className="flex items-center gap-3 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-500 flex-1">Créer une nouvelle image...</span>
                <span className="text-2xl">🎨</span>
              </Link>
            </div>

            {/* Posts */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Chargement du feed...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📰</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun post pour le moment</h3>
                <p className="text-gray-500 mb-6">Sois le premier à créer quelque chose !</p>
                <Link to="/editor" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
                  Créer un post
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => {
                  const isLiked = likesStatus[post.id] || false;
                  const showComments = commentsVisible[post.id] || false;
                  const postComments = comments[post.id] || [];
                  const isLoadingComments = loadingComments[post.id] || false;
                  
                  return (
                    <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      {/* Header du post */}
                      <div className="p-4 flex items-center gap-3">
                        <Link to={`/user/${post.user_id}`}>
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {post.username.charAt(0).toUpperCase()}
                          </div>
                        </Link>
                        <div className="flex-1">
                          <Link to={`/user/${post.user_id}`} className="font-bold text-gray-800 hover:underline">
                            {post.username}
                          </Link>
                          <p className="text-sm text-gray-500">Il y a quelques instants</p>
                        </div>
                      </div>

                      {/* Image */}
                      <div className="relative w-full bg-gray-100">
                        <img
                          src={post.generated_image}
                          alt={post.title}
                          className="w-full object-contain"
                          style={{ maxHeight: '600px' }}
                        />
                      </div>

                      {/* Actions */}
                      <div className="p-4">
                        <div className="flex items-center gap-4 mb-3">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 ${
                              isLiked
                                ? 'text-red-500'
                                : 'text-gray-600 hover:text-red-500'
                            } transition-colors`}
                          >
                            <svg 
                              className="w-6 h-6" 
                              fill={isLiked ? "currentColor" : "none"} 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="font-semibold">{post.likes_count}</span>
                          </button>

                          <button 
                            onClick={() => toggleComments(post.id)}
                            className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="font-semibold">{post.comments_count || 0}</span>
                          </button>

                          <div className="flex items-center gap-2 text-gray-600 ml-auto">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="text-sm">{post.views_count}</span>
                          </div>
                        </div>

                        {/* Titre et description */}
                        <div>
                          <p className="font-bold text-gray-800">{post.title}</p>
                          {post.description && (
                            <p className="text-gray-600 mt-1">{post.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Section Commentaires */}
                      {showComments && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          {/* Liste des commentaires */}
                          {isLoadingComments ? (
                            <div className="text-center py-4">
                              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                          ) : postComments.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">Aucun commentaire</p>
                          ) : (
                            <div className="space-y-3 mb-4">
                              {postComments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {comment.username.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 bg-white rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="font-bold text-sm text-gray-800">{comment.username}</p>
                                      {comment.user_id === user.id && (
                                        <button
                                          onClick={() => handleDeleteComment(post.id, comment.id)}
                                          className="text-red-500 hover:text-red-700 text-xs"
                                        >
                                          Supprimer
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

                          {/* Ajouter un commentaire */}
                          <div className="flex gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={newComment[post.id] || ''}
                                onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddComment(post.id);
                                  }
                                }}
                                placeholder="Écris un commentaire..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
                              />
                              <button
                                onClick={() => handleAddComment(post.id)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors"
                              >
                                Envoyer
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Droite */}
          <div className="col-span-3 hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-20">
              <h3 className="font-bold text-gray-800 mb-4">Suggestions</h3>
              <div className="space-y-3">
                <div className="text-center py-8 text-gray-500 text-sm">
                  <p>🔥 Fonctionnalité</p>
                  <p>à venir bientôt !</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feed;