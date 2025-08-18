import React, { useState } from 'react';
import { Search, MessageCircle, Hash, Users, Plus, MoreVertical } from 'lucide-react';
import { Chat } from '../types';

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string;
  onChatSelect: (chatId: string) => void;
  isCollapsed: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  chats, 
  activeChat, 
  onChatSelect, 
  isCollapsed 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col items-center py-4 space-y-4">
        {chats.slice(0, 6).map((chat) => (
          <button
            key={chat.id}
            onClick={() => onChatSelect(chat.id)}
            className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
              activeChat === chat.id
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            {chat.avatar ? (
              <img src={chat.avatar} alt={chat.name} className="w-8 h-8 rounded-lg" />
            ) : (
              <span className="text-sm font-semibold">
                {chat.name.charAt(0).toUpperCase()}
              </span>
            )}
            {chat.unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
              </div>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Messages</h2>
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white text-sm"
            placeholder="Search conversations..."
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm">No conversations found</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`w-full p-3 rounded-xl text-left transition-all duration-200 hover:bg-gray-50 ${
                  activeChat === chat.id
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                      {chat.avatar ? (
                        <img src={chat.avatar} alt={chat.name} className="w-full h-full rounded-xl" />
                      ) : (
                        chat.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-semibold truncate ${
                        activeChat === chat.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {chat.name}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${
                      chat.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                    }`}>
                      {chat.lastMessage}
                    </p>
                    
                    {/* Chat type indicator */}
                    <div className="flex items-center mt-2 space-x-1">
                      {chat.participants.length > 2 ? (
                        <Users className="w-3 h-3 text-gray-400" />
                      ) : (
                        <Hash className="w-3 h-3 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-400">
                        {chat.participants.length > 2 
                          ? `${chat.participants.length} members`
                          : 'Direct message'
                        }
                      </span>
                    </div>
                  </div>

                  {/* More options (Düzeltildi) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation(); 
                      // Buraya MoreVertical iconuna tıklandığında yapılacak işlemleri ekleyebilirsiniz
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all duration-200 cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50">
        <div className="text-xs text-gray-500 text-center">
          {filteredChats.length} conversation{filteredChats.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;