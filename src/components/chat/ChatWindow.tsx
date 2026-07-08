import * as React from 'react';
import { Send, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { GlassCard, GlassButton } from '../common/Layout';
import ChatBubble from './ChatBubble';
import { ChatMessage, sendMessage, subscribeToMessages, resetGroupUnreadCount, uploadChatImage } from '@/src/services/chatService';
import { useAuth } from '@/src/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface ChatWindowProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWindow({ groupId, isOpen, onClose }: ChatWindowProps) {
  const { user, profile } = useAuth();

  // Reset unread count when chat is opened
  React.useEffect(() => {
    if (isOpen && groupId && user?.uid && profile?.unreadByGroup?.[groupId]) {
      resetGroupUnreadCount(user.uid, groupId, profile.unreadByGroup[groupId]);
    }
  }, [isOpen, groupId, user?.uid, !!profile?.unreadByGroup?.[groupId]]);

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [text, setText] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [lastVisible, setLastVisible] = React.useState<any>(null);

  React.useEffect(() => {
    if (groupId) {
      const unsub = subscribeToMessages(groupId, 25, (msgs) => {
        setMessages(msgs);
      });
      return unsub;
    }
  }, [groupId, user?.uid]);

  const loadMore = async () => {
    if (!groupId || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    
    // We need the raw document snapshot for startAfter.
    // Since our service returns data, we'll need a way to get it.
    // For now, I'll simplify: real pagination usually needs the query results.
    // I'll skip the 'Load More' button for now to keep it stable, but the limit is already there in the listener.
    // The user's primary concern was the "Trap" of reading all messages every time.
    // The limit(25) I added earlier in subscribeToMessages already solves this.
    setLoadingMore(false);
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user || !profile) return;
    
    await sendMessage(groupId, {
      senderId: user.uid,
      senderName: profile.name || 'Student',
      content: text
    });
    
    setText('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !profile) return;
    
    setIsUploading(true);
    try {
      const imageUrl = await uploadChatImage(groupId, file);
      await sendMessage(groupId, {
        senderId: user.uid,
        senderName: profile.name || 'Student',
        content: imageUrl
      });
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 w-96 max-w-[90vw] h-[500px] z-50 flex flex-col shadow-2xl rounded-3xl overflow-hidden bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-800">
        <h3 className="font-bold dark:text-white">Group Chat</h3>
        <button onClick={onClose} className="dark:text-slate-400"><X size={18} /></button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {messages.map((msg, i) => (
          <ChatBubble 
            key={i} 
            content={msg.content} 
            isOwn={msg.senderId === user?.uid} 
            senderName={msg.senderName} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2 items-center dark:border-slate-800">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleImageUpload}
        />
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 text-slate-400 hover:text-primary transition-colors disabled:opacity-50 dark:text-slate-500"
        >
          {isUploading ? <Loader2 className="animate-spin" size={18} /> : <ImageIcon size={18} />}
        </button>
        <input 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          placeholder="Type a message..."
          disabled={isUploading}
        />
        <GlassButton type="submit" variant="primary" className="p-2" disabled={isUploading}><Send size={16} /></GlassButton>
      </form>
    </motion.div>
  );
}
