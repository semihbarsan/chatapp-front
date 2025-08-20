import React, { useState, useRef, useEffect } from 'react';
import { Send, LogOut, MessageCircle, Users, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/AuthProvider';
import { Message, Chat as ChatType } from '../types';
import ChatMessage from './ChatMessage';
import ChatSidebar from './ChatSidebar';
import * as signalR from '@microsoft/signalr';
import { HubConnection } from '@microsoft/signalr';

const Chat = () => {
  const { user, logout } = useAuth();
  const [activeChat, setActiveChat] = useState('1');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chats] = useState<ChatType[]>([
    {
      id: '1',
      name: 'General Chat',
      lastMessage: 'You can start typing your messages below!',
      lastMessageTime: new Date(Date.now() - 180000),
      unreadCount: 0,
      participants: ['1', '2'],
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      lastMessage: 'Hey! How are you doing?',
      lastMessageTime: new Date(Date.now() - 3600000),
      unreadCount: 2,
      participants: ['1', '3'],
    },
    {
      id: '3',
      name: 'Team Project',
      lastMessage: 'The deadline is next Friday',
      lastMessageTime: new Date(Date.now() - 7200000),
      unreadCount: 5,
      participants: ['1', '2', '3', '4'],
    },
    {
      id: '4',
      name: 'Alex Johnson',
      lastMessage: 'Thanks for the help!',
      lastMessageTime: new Date(Date.now() - 86400000),
      unreadCount: 0,
      participants: ['1', '5'],
    },
    {
      id: '5',
      name: 'Design Team',
      lastMessage: 'New mockups are ready for review',
      lastMessageTime: new Date(Date.now() - 172800000),
      unreadCount: 1,
      participants: ['1', '2', '6', '7'],
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [connection, setConnection] = useState<HubConnection | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:7027/chathub")
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  // BURADAKİ useEffect DEĞİŞTİ. activeChat bağımlılığı kaldırıldı.
  useEffect(() => {
    if (connection && user) {
      const startConnection = async () => {
        try {
          await connection.start();
          console.log('SignalR Bağlantısı Başarılı!');
          await connection.invoke("JoinChat", user.username, "General Chat");
          console.log('General Chat odasına başarıyla katıldı.');

          connection.on("ReceiveMessage", (receivedUser: string, receivedMessage: string) => {
    // Mesajı gönderen kişiyseniz, mesajı tekrar eklemeyi atla
    if (receivedUser === user?.username) {
        return; // Fonksiyondan çık
    }
    
    const newMessage: Message = {
        id: Date.now().toString(),
        content: receivedMessage,
        timestamp: new Date(),
        userId: 'tempId',
        username: receivedUser,
        isOwn: false, // Kendi mesajımız olmadığı için false
        chatId: '1',
    };
    setMessages(prev => [...prev, newMessage]);
});
        } catch (err) {
          console.error('Bağlantı veya odaya katılma hatası: ', err);
        }
      };
      startConnection();
    }
  }, [connection, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const currentChat = chats.find(chat => chat.id === activeChat);
  const currentMessages = messages.filter(message => message.chatId === activeChat);

  const handleChatSelect = (chatId: string) => {
    if (activeChat && connection && user) {
      const currentChat = chats.find(c => c.id === activeChat);
      if (currentChat) {
        connection.invoke("LeaveChat", user.username, currentChat.name)
          .catch(err => console.error("Odadan ayrılma hatası: ", err));
      }
    }

    if (connection && user) {
      const newChat = chats.find(c => c.id === chatId);
      if (newChat) {
        connection.invoke("JoinChat", user.username, newChat.name)
          .catch(err => console.error("Odaya katılma hatası: ", err));
      }
    }

    setActiveChat(chatId);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !connection) return;

    const currentChat = chats.find(c => c.id === activeChat);
    if (currentChat) {
      const localMessage: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        timestamp: new Date(),
        userId: 'tempId',
        username: user.username,
        isOwn: true,
        chatId: activeChat,
      };
      setMessages(prev => [...prev, localMessage]);

      connection.invoke("SendMessageToRoom", user.username, newMessage.trim(), currentChat.name)
        .catch(err => console.error("Mesaj gönderme hatası: ", err.toString()));
    }
    setNewMessage('');
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex h-full">
        {/* Sidebar */}
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          onChatSelect={handleChatSelect}
          isCollapsed={sidebarCollapsed}
        />
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                >
                  {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </button>
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-md">
                  {currentChat?.name?.charAt(0).toUpperCase() || <MessageCircle className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {currentChat?.name || 'ChatApp'}
                  </h1>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-sm text-gray-600">
                      {currentChat?.participants?.length && currentChat.participants.length > 2
                        ? `${currentChat.participants.length} members`
                        : isOnline ? 'Online' : 'Offline'
                      }
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="hidden lg:block p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Users className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={logout}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Messages Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                  <p className="text-sm text-center">Start a conversation by sending a message below</p>
                </div>
              ) : (
                currentMessages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Message Input */}
            <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 px-6 py-4">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder={`Message ${currentChat?.name || 'chat'}...`}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white max-h-32"
                      rows={1}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              {/* Typing indicator placeholder */}
              <div className="mt-2 text-xs text-gray-500 italic opacity-0 transition-opacity">
                Someone is typing...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;