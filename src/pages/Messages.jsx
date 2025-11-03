// src/pages/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import authService from '../services/authService';
import messageService from '../services/messageService';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

function Messages() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    loadConversations();
  }, [navigate]);

  useEffect(() => {
    const contactId = searchParams.get('contact');
    if (contactId && user) {
      if (!loading) {
        const contact = conversations.find(c => c.contact_id === parseInt(contactId));
        if (contact) {
          handleSelectContact(contact);
        } else {
          createNewConversation(parseInt(contactId));
        }
      }
    }
  }, [searchParams, conversations, loading, user]);

  useEffect(() => {
    if (!selectedContact) return;
    const interval = setInterval(() => {
      loadMessages(selectedContact.contact_id);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedContact]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      if (response.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (contactId) => {
    try {
      const response = await messageService.getMessages(contactId);
      if (response.success) {
        const serverMessages = response.data.messages;
        setMessages(prevMessages => {
          if (serverMessages.length > prevMessages.length) {
            setTimeout(() => scrollToBottom(), 100);
            return serverMessages;
          }
          if (serverMessages.length === prevMessages.length) {
            const lastServerMsg = serverMessages[serverMessages.length - 1];
            const lastLocalMsg = prevMessages[prevMessages.length - 1];
            if (!lastLocalMsg || lastServerMsg.id !== lastLocalMsg.id) {
              return serverMessages;
            }
          }
          return prevMessages;
        });
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const createNewConversation = async (contactId) => {
    try {
      const friendServiceModule = await import('../services/friendService');
      const friendService = friendServiceModule.default;
      const response = await friendService.getFriends();
      
      if (response.success) {
        const friend = response.data.friends.find(f => f.id === parseInt(contactId));
        if (friend) {
          const newContact = {
            contact_id: friend.id,
            username: friend.username,
            email: friend.email,
            avatar: friend.avatar,
            last_message: 'Nouvelle conversation',
            last_message_time: new Date().toISOString(),
            unread_count: 0
          };
          const exists = conversations.some(c => c.contact_id === friend.id);
          if (!exists) {
            setConversations([newContact, ...conversations]);
          }
          setSelectedContact(newContact);
          setMessages([]);
        } else {
          alert('❌ Cet utilisateur n\'est pas dans tes amis');
          navigate('/friends');
        }
      }
    } catch (error) {
      console.error('Erreur création conversation:', error);
      alert('❌ Erreur lors de l\'ouverture de la conversation');
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    loadMessages(contact.contact_id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const messageToSend = newMessage.trim();
    const tempId = Date.now();
    
    const optimisticMessage = {
      id: tempId,
      sender_id: user.id,
      receiver_id: selectedContact.contact_id,
      message_text: messageToSend,
      sent_at: new Date().toISOString(),
      sender_username: user.username,
      is_read: false
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setTimeout(() => scrollToBottom(), 50);
    
    try {
      const response = await messageService.sendMessage(selectedContact.contact_id, messageToSend);
      if (response.success) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId 
              ? {
                  id: response.data.id,
                  sender_id: response.data.sender_id,
                  receiver_id: response.data.receiver_id,
                  message_text: response.data.message_text,
                  sent_at: response.data.sent_at,
                  sender_username: user.username,
                  is_read: response.data.is_read
                }
              : msg
          )
        );
        setConversations(conversations.map(conv => {
          if (conv.contact_id === selectedContact.contact_id) {
            return {
              ...conv,
              last_message: messageToSend,
              last_message_time: response.data.sent_at
            };
          }
          return conv;
        }));
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      alert('❌ Erreur lors de l\'envoi du message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    try {
      const response = await messageService.deleteMessage(messageId);
      if (response.success) {
        setMessages(messages.filter(m => m.id !== messageId));
      }
    } catch (error) {
      console.error('Erreur suppression message:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 pt-16">
      <div className="h-full max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex">
          {/* Liste des conversations */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b bg-white">
              <h2 className="text-xl font-bold text-gray-800">Messages</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-5xl mb-3">💬</div>
                  <p className="text-gray-600 text-sm mb-3">Aucune conversation</p>
                  <Link to="/friends" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                    Ajouter des amis →
                  </Link>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.contact_id}
                    onClick={() => handleSelectContact(conv)}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      selectedContact?.contact_id === conv.contact_id
                        ? 'bg-blue-50 border-l-4 border-l-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {conv.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-gray-800 truncate">{conv.username}</h3>
                          {conv.unread_count > 0 && (
                            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Zone de conversation */}
          <div className="flex-1 flex flex-col">
            {!selectedContact ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Sélectionne une conversation
                  </h3>
                  <p className="text-gray-600">
                    Choisis un contact pour commencer à discuter
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-4 border-b bg-white flex items-center gap-3">
                  <Link 
                    to={`/user/${selectedContact.contact_id}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedContact.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {selectedContact.username}
                      </h3>
                      <p className="text-xs text-gray-500">Cliquer pour voir le profil</p>
                    </div>
                  </Link>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="text-5xl mb-4">💬</div>
                      <p className="text-gray-600">Aucun message</p>
                      <p className="text-sm text-gray-500 mt-2">Commence la conversation !</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {messages.map((msg, index) => {
                        const isMe = msg.sender_id === parseInt(user.id);
                        const prevMsg = index > 0 ? messages[index - 1] : null;
                        const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;
                        const groupWithPrev = prevMsg && prevMsg.sender_id === msg.sender_id;
                        const groupWithNext = nextMsg && nextMsg.sender_id === msg.sender_id;
                        const showAvatar = !groupWithNext;
                        const showTime = !groupWithNext;

                        return (
                          <div
                            key={msg.id}
                            className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} ${
                              groupWithPrev ? 'mt-0.5' : 'mt-3'
                            }`}
                          >
                            <div className="w-8 h-8 flex-shrink-0">
                              {!isMe && showAvatar && (
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                  {selectedContact.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col max-w-[70%]">
                              <div
                                className={`group relative px-4 py-2 break-words ${
                                  isMe
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-gray-800 border border-gray-200'
                                } ${
                                  isMe
                                    ? groupWithPrev && groupWithNext
                                      ? 'rounded-2xl rounded-tr-md rounded-br-md'
                                      : groupWithPrev
                                      ? 'rounded-2xl rounded-tr-md'
                                      : groupWithNext
                                      ? 'rounded-2xl rounded-br-md'
                                      : 'rounded-2xl rounded-br-md'
                                    : groupWithPrev && groupWithNext
                                    ? 'rounded-2xl rounded-tl-md rounded-bl-md'
                                    : groupWithPrev
                                    ? 'rounded-2xl rounded-tl-md'
                                    : groupWithNext
                                    ? 'rounded-2xl rounded-bl-md'
                                    : 'rounded-2xl rounded-bl-md'
                                } shadow-sm hover:shadow-md transition-shadow`}
                              >
                                <p className="whitespace-pre-wrap">{msg.message_text}</p>

                                {isMe && (
                                  <div
                                    className={`absolute top-0 left-0 -translate-x-full opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 px-2`}
                                  >
                                    <button
                                      onClick={() => handleDeleteMessage(msg.id)}
                                      className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full text-xs"
                                      title="Supprimer"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                )}
                              </div>

                              {showTime && (
                                <div className={`flex items-center gap-1 mt-0.5 px-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-xs text-gray-500">
                                    {formatTime(msg.sent_at)}
                                  </span>
                                  {isMe && (
                                    <span className="text-xs text-gray-500">
                                      {msg.is_read ? '✓✓' : '✓'}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                      placeholder="Écris un message..."
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                    >
                      Envoyer
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;