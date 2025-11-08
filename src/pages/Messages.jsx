// src/pages/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import authService from '../services/authService';
import messageService from '../services/messageService';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import MobileNav from '../components/MobileNav';

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
    <div className="h-screen bg-gray-50 pb-20 lg:pb-0">
      <div className="h-full max-w-5xl mx-auto flex">
        <div className="bg-white shadow-sm overflow-hidden h-full flex w-full">
          {/* Liste des conversations */}
          <div className={`${selectedContact ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 border-r border-gray-200 flex-col`}>
            <div className="p-3 border-b bg-white">
              <h2 className="text-lg font-semibold text-gray-900">💬 Messages</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-3xl mb-2">💬</div>
                  <p className="text-gray-600 text-sm mb-2">Aucune conversation</p>
                  <Link to="/friends" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Ajouter des amis →
                  </Link>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.contact_id}
                    onClick={() => handleSelectContact(conv)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedContact?.contact_id === conv.contact_id
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {conv.username.charAt(0).toUpperCase()}
                        </div>
                        {conv.unread_count > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {conv.unread_count > 9 ? '9+' : conv.unread_count}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="font-medium text-gray-900 truncate text-sm">{conv.username}</h3>
                          <span className="text-xs text-gray-500">{formatTime(conv.last_message_time)}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{conv.last_message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Zone de conversation */}
          <div className={`${selectedContact ? 'flex' : 'hidden lg:flex'} flex-1 flex-col`}>
            {!selectedContact ? (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="text-4xl mb-3">💬</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Sélectionne une conversation
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Choisis un contact pour discuter
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-3 border-b bg-white flex items-center gap-3">
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <Link 
                    to={`/user/${selectedContact.contact_id}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedContact.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">
                        {selectedContact.username}
                      </h3>
                      <p className="text-xs text-gray-500">Voir le profil</p>
                    </div>
                  </Link>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-3xl mb-2">💬</div>
                      <p className="text-gray-600 text-sm">Aucun message</p>
                      <p className="text-xs text-gray-500 mt-1">Commence la conversation !</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
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
                              groupWithPrev ? 'mt-0.5' : 'mt-2'
                            }`}
                          >
                            <div className="w-6 h-6 flex-shrink-0">
                              {!isMe && showAvatar && (
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                  {selectedContact.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col max-w-[75%]">
                              <div
                                className={`group relative px-3 py-2 break-words text-sm ${
                                  isMe
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-gray-800'
                                } ${
                                  isMe
                                    ? groupWithPrev && groupWithNext
                                      ? 'rounded-2xl rounded-tr-lg'
                                      : groupWithPrev
                                      ? 'rounded-2xl rounded-tr-lg'
                                      : groupWithNext
                                      ? 'rounded-2xl rounded-br-lg'
                                      : 'rounded-2xl'
                                    : groupWithPrev && groupWithNext
                                    ? 'rounded-2xl rounded-tl-lg'
                                    : groupWithPrev
                                    ? 'rounded-2xl rounded-tl-lg'
                                    : groupWithNext
                                    ? 'rounded-2xl rounded-bl-lg'
                                    : 'rounded-2xl'
                                } shadow-sm`}
                              >
                                <p className="whitespace-pre-wrap">{msg.message_text}</p>

                                {isMe && (
                                  <div
                                    className={`absolute top-0 left-0 -translate-x-full opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 px-1`}
                                  >
                                    <button
                                      onClick={() => handleDeleteMessage(msg.id)}
                                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full text-xs"
                                      title="Supprimer"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                )}
                              </div>

                              {showTime && (
                                <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-xs text-gray-400">
                                    {formatTime(msg.sent_at)}
                                  </span>
                                  {isMe && (
                                    <span className="text-xs text-gray-400">
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
                <div className="p-3 border-t bg-white">
                  <div className="flex gap-2 items-end">
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
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-full focus:border-blue-500 focus:outline-none bg-gray-50 focus:bg-white transition-colors"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-full transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}

export default Messages;