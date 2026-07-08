import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLinkClickHandler, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  Settings, 
  GraduationCap, 
  CreditCard,
  MessageSquare,
  LogOut,
  Bell,
  Menu,
  X,
  Award,
  BarChart3,
  TrendingUp,
  FileEdit,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { UserRole } from '@/src/context/AuthContext';
import { auth, db, getMessagingInstance } from '@/src/firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getToken, onMessage } from 'firebase/messaging';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/context/ThemeContext';
import NotificationCenter from './NotificationCenter';
import PWAInstallButton from '../common/PWAInstallButton';
import { WhatsAppSupportButton } from '../whatsapp/WhatsAppSupportButton';
import { useLanguage } from '@/src/context/LanguageContext';
import ChatWindow from '@/src/components/chat/ChatWindow';
import StudentChatbot from './StudentChatbot';
import { WhatsAppSupportModal } from '../whatsapp/WhatsAppSupportModal';
import SecurityLayer from '@/src/components/common/SecurityLayer';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  roles: UserRole[];
}

export default function DashboardLayout({ 
  children, 
  role: initialRole, 
  userName: initialUserName 
}: { 
  children: React.ReactNode, 
  role: UserRole,
  userName: string 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth > 768);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [isSupportOpen, setIsSupportOpen] = React.useState(false);
  const { profile, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { t, isRtl, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  
  const role = profile?.role || initialRole;
  const userName = profile?.name || user?.displayName || initialUserName;
  
  const getSidebarItems = (): SidebarItem[] => [
    { icon: LayoutDashboard, label: t('navOverview'), href: '/dashboard/student', roles: ['student', 'trial'] },
    { icon: LayoutDashboard, label: t('navOverview'), href: '/dashboard', roles: ['trainer', 'supervisor', 'admin'] },
    { icon: BarChart3, label: t('navSupervisor'), href: '/dashboard/supervisor', roles: ['supervisor', 'admin'] },
    { icon: GraduationCap, label: t('navProfile'), href: '/dashboard/profile', roles: ['student', 'trainer', 'supervisor', 'admin'] },
    { icon: Users, label: t('navGroups'), href: '/dashboard/groups', roles: ['trainer', 'supervisor', 'admin'] },
    { icon: Calendar, label: t('navAttendance'), href: '/dashboard/attendance', roles: ['trainer', 'supervisor', 'admin'] },
    { icon: TrendingUp, label: t('navProgress'), href: '/dashboard/progress', roles: ['trainer', 'supervisor', 'admin'] },
    { icon: BookOpen, label: t('navMyCourses'), href: '/dashboard/student/courses', roles: ['student', 'trial', 'trainer'] },
    { icon: CreditCard, label: t('navBilling'), href: '/dashboard/student/billing', roles: ['student', 'trial', 'admin', 'supervisor'] },
    { icon: FileEdit, label: t('navCMS'), href: '/dashboard/cms', roles: ['admin'] },
    { icon: Settings, label: t('navControl'), href: '/dashboard/admin', roles: ['admin'] },
  ];

  const filteredNav = getSidebarItems().filter(item => item.roles.includes(role));

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const currentPath = window.location.pathname;

  // 1. PWA Title & App Badge Support
  React.useEffect(() => {
    const originalTitle = "TKA Egypt";
    const totalUnread = profile?.totalUnread || 0;
    
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) ${t('navNotifications')} - ${originalTitle}`;
      
      // Update PWA App Badge
      if ('setAppBadge' in navigator) {
        (navigator as any).setAppBadge(totalUnread).catch(console.error);
      }
    } else {
      document.title = originalTitle;
      if ('clearAppBadge' in navigator) {
        (navigator as any).clearAppBadge().catch(console.error);
      }
    }
  }, [profile?.totalUnread, t]);

  // 2. Firebase Cloud Messaging Setup
  const prevUnreadCount = React.useRef(profile?.totalUnread || 0);
  const prevIsLive = React.useRef(false);
  const soundRef = React.useRef(new Audio("https://actions.google.com/sounds/v1/notifications/piece_of_cake.ogg"));

  // Watch for new chat messages via totalUnread
  React.useEffect(() => {
     if (profile?.totalUnread !== undefined && profile.totalUnread > prevUnreadCount.current) {
        soundRef.current.play().catch(console.error);
     }
     prevUnreadCount.current = profile?.totalUnread || 0;
  }, [profile?.totalUnread]);

  // Watch for Live Session Started
  React.useEffect(() => {
    const groupId = profile?.groupId;
    if (groupId) {
      const unsub = onSnapshot(doc(db, 'groups', groupId), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.isLive && !prevIsLive.current) {
            soundRef.current.play().catch(console.error);
          }
          prevIsLive.current = !!data.isLive;
        }
      });
      return unsub;
    }
  }, [profile?.groupId]);

  // Watch for new system notifications
  React.useEffect(() => {
    if (user) {
      // We listen for the latest notification to play sound
      const q = query(
        collection(db, 'notifications'), 
        where('recipientId', '==', user.uid), 
        orderBy('createdAt', 'desc'), 
        limit(1)
      );
      
      let initialLoad = true;
      const unsub = onSnapshot(q, (snap) => {
        if (!initialLoad && !snap.empty) {
          const latest = snap.docs[0].data();
          // Only play if it's very recent (last 10 seconds)
          if (latest.createdAt > Date.now() - 10000) {
            soundRef.current.play().catch(console.error);
          }
        }
        initialLoad = false;
      });
      return unsub;
    }
  }, [user]);

  React.useEffect(() => {
    const setupFCM = async () => {
      const messaging = await getMessagingInstance();
      if (!messaging || !user) return;

      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: 'BDm5P3-p_V-F8n-C9z_e8-5L_6a_y_X_f_7_p_Y_L_U_I' // Placeholder - Needs real VAPID key usually
          });
          
          if (token) {
            await updateDoc(doc(db, 'users', user.uid), {
              fcmToken: token,
              lastTokenUpdate: Date.now()
            });
          }
        }
      } catch (error) {
        console.warn('FCM Setup failed (possibly blocked by browser/iframe):', error);
      }
    };

    const startFCMSub = async () => {
      const messaging = await getMessagingInstance();
      if (user && messaging) {
        setupFCM();
        
        // Foreground listener
        return onMessage(messaging, (payload) => {
          console.log('FCM Message received in foreground:', payload.notification?.title || 'No Title');
          // We could trigger a toast here
        });
      }
    };

    const unsubPromise = startFCMSub();
    return () => {
      unsubPromise.then(unsub => unsub?.());
    };
  }, [user]);

  return (
    <SecurityLayer>
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-primary/30 relative">
        <AnimatePresence>
          {isSidebarOpen && window.innerWidth <= 768 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30"
            />
          )}
        </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 bottom-0 z-40 bg-white/70 backdrop-blur-2xl border-r border-slate-200 transition-all duration-300 dark:bg-slate-900/70 dark:border-white/5",
        isSidebarOpen ? "translate-x-0 w-64 shadow-2xl shadow-slate-200/50 dark:shadow-black/50" : "-translate-x-full md:translate-x-0 md:w-20"
      )}>
        <div className="flex flex-col h-full py-6 px-4">
          <div className="flex items-center gap-3 mb-10 px-2 justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={isDarkMode ? "/logo-dark.png" : "/logo-light.png"} 
                alt="TKA Logo" 
                className="w-10 h-10 object-contain drop-shadow-sm" 
              />
            </div>
            {window.innerWidth <= 768 && (
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={20} />
              </button>
            )}
          </div>

          <nav className="flex-1 space-y-1.5">
            {filteredNav.map((item, i) => {
              const isActive = currentPath === item.href || (item.href === '/dashboard' && role && currentPath === `/dashboard/${role}`);
              return (
                <Link
                  key={i}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden font-medium",
                    isActive 
                      ? "bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/30" 
                      : "hover:bg-slate-100 text-slate-500 hover:text-slate-900 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-white"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                  )}
                  <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "text-white" : "group-hover:scale-110", isActive ? "scale-110" : "")} />
                  {isSidebarOpen && <span className="text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-200/50 pt-6 mt-auto dark:border-white/10 space-y-2 relative before:absolute before:inset-x-0 before:-top-px before:h-px before:bg-gradient-to-r before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
            <button 
              onClick={() => setIsSupportOpen(true)}
              className="flex items-center gap-4 p-3.5 w-full rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-[#25D366]/10 text-slate-500 hover:text-[#25D366] transition-all group dark:hover:bg-[#25D366]/20 border border-slate-100 dark:border-slate-800"
            >
              <MessageSquare className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              {isSidebarOpen && <span className="text-sm font-medium">{t('common.support')}</span>}
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 p-3.5 w-full rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-red-50 text-slate-500 hover:text-red-500 transition-all group dark:hover:bg-red-900/20 border border-slate-100 dark:border-slate-800"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {isSidebarOpen && <span className="text-sm font-medium">{t('common.logout')}</span>}
            </button>
            {isSidebarOpen && (
              <div className="pt-4 mt-6 text-center px-4">
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-tight opacity-50">
                  {t('footerCopyright')}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 min-w-0 bg-slate-50/50 dark:bg-transparent",
        isSidebarOpen ? "md:ml-64" : "md:ml-20"
      )}>
        {/* Header */}
        <header className="h-20 border-b border-slate-200/50 bg-white/70 backdrop-blur-xl sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between dark:bg-slate-900/70 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-2.5 bg-white shadow-sm border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/80 active:scale-95"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-xs md:text-sm font-semibold uppercase tracking-widest text-slate-400 hidden sm:block bg-gradient-to-r from-slate-400 to-slate-300 bg-clip-text text-transparent">{t('common.dashboard')}</h2>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden md:block">
              <PWAInstallButton />
            </div>
            
            <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <button 
                onClick={toggleTheme}
                className="p-2 md:px-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 active:scale-95"
                title={isDarkMode ? t('common.lightMode') : t('common.darkMode')}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              
              <button 
                onClick={toggleLanguage} 
                className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors dark:hover:bg-slate-700 active:scale-95"
                title={t('common.switchLang')}
              >
                <span className="font-bold text-xs md:text-sm text-slate-600 dark:text-slate-300">{language === 'ar' ? 'EN' : 'عربي'}</span>
              </button>
            </div>
            
            <NotificationCenter />
            
            <button 
              onClick={() => setIsChatOpen(true)}
              className="relative p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors active:scale-95"
            >
              <MessageSquare size={18} className="md:w-5 md:h-5" />
              {(profile?.totalUnread ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white rounded-full text-[9px] md:text-[10px] flex items-center justify-center font-bold border-2 border-white animate-pulse">
                  {profile?.totalUnread}
                </span>
              )}
            </button>
            
            <div className="flex items-center gap-2 md:gap-3 ml-1 md:ml-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{userName}</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter">{t(role as any)}</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-700 dark:bg-slate-800 shrink-0">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} 
                  alt="avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex-1 pb-24 md:pb-8">
          {children}
        </div>
        <AnimatePresence>
          {isChatOpen && (
            <ChatWindow groupId={profile?.groupId || 'general'} isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          )}
        </AnimatePresence>
        
        {/* Global Chatbot */}
        <StudentChatbot />
        <WhatsAppSupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
        <WhatsAppSupportButton />
      </main>
    </div>
  </SecurityLayer>
  );
}
