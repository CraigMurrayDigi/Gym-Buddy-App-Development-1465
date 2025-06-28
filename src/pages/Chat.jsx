import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import Navbar from '../components/Navbar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMessageCircle, FiSend, FiUser, FiArrowLeft } = FiIcons;

const Chat = () => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const messagesEndRef = useRef(null);
  const { buddyId } = useParams();
  const { user } = useAuth();
  const { chats, messages, sendMessage } = useData();
  const navigate = useNavigate();

  const userChats = chats.filter(chat => 
    chat.participants.some(participant => participant.id === user.id)
  );

  useEffect(() => {
    if (buddyId && userChats.length > 0) {
      const chat = userChats.find(chat => 
        chat.participants.some(participant => participant.id === buddyId)
      );
      if (chat) {
        setSelectedChat(chat);
      }
    } else if (userChats.length > 0) {
      setSelectedChat(userChats[0]);
    }
  }, [buddyId, userChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    sendMessage(selectedChat.id, user.id, newMessage.trim());
    setNewMessage('');
  };

  const getChatMessages = (chatId) => {
    return messages[chatId] || [];
  };

  const getOtherParticipant = (chat) => {
    return chat.participants.find(participant => participant.id !== user.id);
  };

  if (userChats.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <SafeIcon icon={FiMessageCircle} className="text-6xl text-gray-300 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No conversations yet</h2>
            <p className="text-gray-600 mb-6">
              Start chatting with workout buddies by joining their sessions or inviting them to yours.
            </p>
            <button
              onClick={() => navigate('/find-buddies')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Find Workout Buddies
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            {/* Chat List */}
            <div className="w-1/3 border-r border-gray-200 bg-gray-50">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              </div>
              <div className="overflow-y-auto h-full pb-16">
                {userChats.map((chat) => {
                  const otherParticipant = getOtherParticipant(chat);
                  const lastMessage = chat.lastMessage;
                  
                  return (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors ${
                        selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center">
                          <SafeIcon icon={FiUser} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {otherParticipant.name}
                          </div>
                          {lastMessage && (
                            <div className="text-sm text-gray-500 truncate">
                              {lastMessage.content}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedChat(null)}
                        className="md:hidden text-gray-600 hover:text-gray-800"
                      >
                        <SafeIcon icon={FiArrowLeft} />
                      </button>
                      <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center">
                        <SafeIcon icon={FiUser} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {getOtherParticipant(selectedChat).name}
                        </div>
                        <div className="text-sm text-gray-500">Workout Buddy</div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                    {getChatMessages(selectedChat.id).map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.fromUserId === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.fromUserId === user.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <div className="text-sm">{message.content}</div>
                          <div
                            className={`text-xs mt-1 ${
                              message.fromUserId === user.id ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <SafeIcon icon={FiSend} />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <SafeIcon icon={FiMessageCircle} className="text-6xl text-gray-300 mb-4 mx-auto" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-500">Choose a chat to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;