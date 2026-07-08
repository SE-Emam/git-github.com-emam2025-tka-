import * as React from 'react';
import { Bot, X, Send, User, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../common/Layout';
import { useAuth } from '@/src/context/AuthContext';
import { studentChatBot } from '@/src/services/aiService';
import { 
  getSystemSettingsFromSQL, 
  getSingleGroupFromSQL, 
  getPaymentsFromSQL 
} from '@/src/services/hybridApiService';

import { useLanguage } from '@/src/context/LanguageContext';

export default function StudentChatbot() {
  const { profile } = useAuth();
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<{ role: string, parts: { text: string }[] }[]>([]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [botSettings, setBotSettings] = React.useState<{ apiKey?: string, context?: string}>({});
  const [studentContext, setStudentContext] = React.useState<any>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // 1. Fetch AI Settings
    getSystemSettingsFromSQL().then((res) => {
      setBotSettings({
        apiKey: res.chatbot_api_key || '',
        context: res.chatbot_context || ''
      });
    });

    // 2. Fetch Student Personal Data for Chat Context
    if (profile?.uid) {
      const fetchData = async () => {
        try {
          const [groupRes, paymentsRes] = await Promise.all([
            profile.groupId ? getSingleGroupFromSQL(profile.groupId) : Promise.resolve(null),
            getPaymentsFromSQL(profile.uid)
          ]);

          const lastPayment = paymentsRes?.[0]; // Assuming payments are sorted by date
          
          setStudentContext({
            name: profile.displayName || profile.name,
            role: profile.role,
            groupName: groupRes?.name || 'غير محدد',
            track: groupRes?.track || 'برمجة عامة',
            lastPayment: lastPayment ? `${lastPayment.amount} جنية بتاريخ ${lastPayment.paidAt}` : 'لا يوجد',
            pendingDues: profile.pendingDues || 0
          });
        } catch (error) {
          console.error("Error fetching chatbot context:", error);
        }
      };
      fetchData();
    }
  }, [profile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setIsTyping(true);

    const newHistory = [...messages, { role: "user", parts: [{ text: userMessage }] }];
    setMessages(newHistory);

    const botResponse = await studentChatBot(messages, userMessage, botSettings, studentContext);
    
    setMessages([...newHistory, { role: "model", parts: [{ text: botResponse }] }]);
    setIsTyping(false);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            drag
            dragConstraints={{ left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 80, bottom: 0 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 group cursor-grab active:cursor-grabbing"
          >
            <Bot size={28} className="group-hover:animate-bounce" />
            <span className="absolute -top-2 -right-2 bg-red-500 w-4 h-4 rounded-full border-2 border-white animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <GlassCard className="h-[550px] w-full max-w-[380px] flex flex-col p-0 overflow-hidden shadow-2xl border-primary/20 bg-white dark:bg-slate-900 !backdrop-blur-3xl">
              {/* Header */}
              <div className="p-4 md:p-6 bg-gradient-to-r from-primary to-primary-600 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 md:p-2.5 rounded-2xl backdrop-blur-sm">
                    <Bot size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                       {language === 'ar' ? 'المساعد الذكي' : 'AI Assistant'} <Sparkles size={16} className="text-yellow-300" />
                    </h3>
                    <p className="text-xs text-white/90">
                      {language === 'ar' 
                        ? `مرحباً ${profile?.displayName?.split(' ')[0] || 'بك'}!`
                        : `Hello ${profile?.displayName?.split(' ')[0] || 'there'}!`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50 px-6">
                    <Bot size={48} className="mb-4 text-slate-400" />
                    <p className="text-sm">{t('chatbotWelcome')}</p>
                  </div>
                )}
                
                {messages.map((msg, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx} 
                    className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm
                      ${msg.role === 'user' ? 'bg-slate-800 dark:bg-slate-600' : 'bg-primary'}`}
                    >
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-3 rounded-2xl max-w-[80%] text-sm shadow-sm
                      ${msg.role === 'user' 
                        ? 'bg-slate-800 text-white rounded-tl-sm dark:bg-slate-700' 
                        : 'bg-white text-slate-800 rounded-tr-sm border border-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700'}`}
                    >
                      {msg.parts[0].text}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <div className="flex items-start gap-2">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                      <Bot size={16} />
                    </div>
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl rounded-tr-sm shadow-sm dark:bg-slate-800 dark:border-slate-700">
                      <Loader2 size={16} className="animate-spin text-primary" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-100 dark:bg-slate-900 dark:border-slate-800 shrink-0">
                <form onSubmit={handleSend} className="flex items-center gap-2 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('chatbotPlaceholder')}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 !py-3 !pl-12 !pr-4 rounded-xl text-sm border-0 focus:ring-2 focus:ring-primary/20 dark:text-white"
                    dir="auto"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="absolute left-2 p-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:hover:bg-primary transition-colors flex items-center justify-center"
                  >
                    <Send size={16} className="rtl:rotate-180" />
                  </button>
                </form>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
