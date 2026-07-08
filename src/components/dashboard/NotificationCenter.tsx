import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Check, CreditCard, MessageSquare, AlertCircle } from 'lucide-react';
import { getMyNotifications, markNotificationRead } from '@/src/services/firestoreService';
import { useAuth } from '@/src/context/AuthContext';
import { cn } from '@/src/lib/utils';
import { useLanguage } from '@/src/context/LanguageContext';

export default function NotificationCenter() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (user) {
      const unsub = getMyNotifications(user.uid, 15, setNotifications);
      return unsub;
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment_reminder': return <CreditCard className="text-orange-500" size={16} />;
      case 'submission': return <MessageSquare className="text-primary" size={16} />;
      default: return <AlertCircle className="text-blue-500" size={16} />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
      >
        <Bell size={20} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed sm:absolute right-4 sm:right-0 mt-4 sm:mt-4 w-[calc(100vw-2rem)] sm:w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-2xl z-50 overflow-hidden"
              style={{ top: '64px' }}
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white">{t('navNotifications')}</h3>
                <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                  {unreadCount} NEW
                </span>
              </div>

              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <Bell className="mx-auto text-slate-200 mb-3" size={32} />
                    <p className="text-xs text-slate-400 font-medium">{t('noNotifications')}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={cn(
                          "p-5 transition-colors cursor-pointer hover:bg-slate-50/50",
                          !n.read && "bg-primary/5"
                        )}
                        onClick={() => markNotificationRead(n.id)}
                      >
                        <div className="flex gap-4">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                            n.read ? "bg-slate-100" : "bg-white"
                          )}>
                            {getIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-xs font-bold text-slate-900 mb-0.5", !n.read && "text-primary")}>
                              {n.title}
                            </p>
                            <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                            <p className="text-[8px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {!n.read && (
                             <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                  <button className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors">
                    CLEAR ALL HISTORY
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
