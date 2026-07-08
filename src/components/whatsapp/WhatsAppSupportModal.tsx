import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';

export const WhatsAppSupportModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { profile, user } = useAuth();
  const { t } = useLanguage();
  const userName = profile?.displayName || user?.displayName || "";
  
  const [name, setName] = React.useState(userName);
  const [purpose, setPurpose] = React.useState('');
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    if (userName) setName(userName);
  }, [userName]);

  const handleSend = () => {
    if (!name || !purpose || !message) return;
    
    const formattedMessage = `*Name:* ${name}\n*Purpose:* ${purpose}\n*Message:* ${message}`;
    const whatsappUrl = `https://wa.me/201062540164?text=${encodeURIComponent(formattedMessage)}`;
    
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh]"
          >
            <div className="bg-[#25D366] p-5 text-white flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MessageSquare size={20} /> {t('whatsappModalTitle')}
              </h3>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('whatsappNameLabel')}</label>
                <input 
                  value={name}
                  readOnly={!!userName}
                  onChange={(e) => !userName && setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#25D366]/20 transition-all dark:text-white"
                  placeholder={t('whatsappNamePlaceholder')}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('whatsappPurposeLabel')}</label>
                <input 
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#25D366]/20 transition-all dark:text-white"
                  placeholder={t('whatsappPurposePlaceholder')}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('whatsappMessageLabel')}</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 h-28 outline-none focus:ring-2 focus:ring-[#25D366]/20 transition-all resize-none dark:text-white"
                  placeholder={t('whatsappMessagePlaceholder')}
                />
              </div>
              <button 
                onClick={handleSend}
                className="w-full py-3.5 bg-[#25D366] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#128C7E] active:scale-[0.98] transition-all shadow-lg shadow-[#25D366]/20"
              >
                {t('whatsappSendBtn')} <Send size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
