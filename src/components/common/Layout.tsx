import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { User, LogOut, LayoutDashboard, Settings, Bell, Search, Menu, X, Globe, Moon, Sun, Headset } from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';

export const GlassCard = ({ 
  children, 
  className, 
  noPadding = false,
  hover = true,
  neon = false,
  variant = 'primary',
  ...props
}: { 
  children?: React.ReactNode, 
  className?: string,
  noPadding?: boolean,
  hover?: boolean,
  neon?: boolean,
  variant?: 'primary' | 'secondary' | 'gold',
  [key: string]: any
}) => (
  <motion.div
    {...props}
    whileHover={hover ? { y: -8, scale: 1.01, transition: { duration: 0.3 } } : undefined}
    className={cn(
      "glass-card overflow-hidden text-slate-800 transition-all duration-300 dark:text-slate-100",
      !noPadding && "p-6",
      neon && (
        variant === 'primary' ? "neon-primary" : 
        variant === 'secondary' ? "neon-secondary" : 
        "neon-gold"
      ),
      className
    )}
  >
    {children}
  </motion.div>
);

export const GlassButton = ({ 
  children, 
  className, 
  onClick,
  variant = 'primary',
  disabled = false,
  icon: Icon,
  shiny = true,
  ...props
}: { 
  children?: React.ReactNode, 
  className?: string,
  onClick?: () => void,
  variant?: 'primary' | 'secondary' | 'danger' | 'gold',
  disabled?: boolean,
  icon?: React.ElementType,
  shiny?: boolean,
  [key: string]: any
}) => (
    <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    disabled={disabled}
    onClick={onClick}
    className={cn(
      "glass-button shiny-btn font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 py-3 px-8 text-base",
      variant === 'primary' && "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 neon-hover-primary",
      variant === 'secondary' && "bg-white/80 text-primary border-primary/20 dark:bg-slate-800/80 dark:text-primary-light dark:border-primary/30",
      variant === 'gold' && "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 neon-hover-primary", // Replaced gold with primary
      variant === 'danger' && "bg-red-500 text-white hover:bg-red-600",
      !shiny && "shiny-btn-disabled", // I'll just keep it enabled by default
      className
    )}
    {...props}
  >
    {Icon && <Icon className="w-5 h-5" />}
    {children}
  </motion.button>
);


import PWAInstallButton from './PWAInstallButton';

import { WhatsAppSupportModal } from '../whatsapp/WhatsAppSupportModal';

export const Navbar = ({ onLogout }: { onLogout?: () => void }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSupportOpen, setIsSupportOpen] = React.useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 dark:bg-slate-950/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-3">
              <img 
                src="/logo-light.png" 
                alt="TKA Logo Light" 
                className={cn("h-10 md:h-12 w-auto object-contain", isDarkMode ? "hidden" : "block")}
                referrerPolicy="no-referrer"
                loading="eager"
              />
              <img 
                src="/logo-dark.png" 
                alt="TKA Logo Dark" 
                className={cn("h-10 md:h-12 w-auto object-contain", isDarkMode ? "block" : "hidden")}
                referrerPolicy="no-referrer"
                loading="eager"
              />
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4 md:gap-8 text-sm font-medium text-slate-700 dark:text-slate-300">
            <div className="hidden xl:block">
              <PWAInstallButton />
            </div>
            <Link to="/" className="hover:text-primary transition-colors">{t('home')}</Link>
            <Link to="/courses" className="hover:text-primary transition-colors">{t('courses')}</Link>
            <Link to="/about" className="hover:text-primary transition-colors">{t('about')}</Link>
            <Link to="/contact" className="hover:text-primary transition-colors">{t('contact')}</Link>
            
            <div className="flex items-center gap-4 ml-4 rtl:mr-4 rtl:ml-0">
              <Link 
                to="/training-request" 
                className="hidden lg:flex px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-bold transition-all"
              >
                {t('trainingRequest')}
              </Link>
              
              <button 
                onClick={toggleTheme}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500 dark:border-slate-800 dark:hover:bg-slate-900"
                title={isDarkMode ? "Light Mode" : "Dark Mode"}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button 
                onClick={() => setIsSupportOpen(true)}
                className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 text-orange-600 font-bold text-xs hover:bg-orange-100 transition-all border border-orange-100 mr-2"
              >
                <Headset size={14} /> {t('techSupport')}
              </button>

              <button 
                onClick={toggleLanguage} 
                className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors dark:border-slate-800 dark:hover:bg-slate-900"
                title="Switch Language"
              >
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-slate-600 dark:text-slate-300">{language === 'ar' ? 'EN' : 'عربي'}</span>
              </button>
              
              <Link to="/login" className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all shiny-btn neon-hover-primary">{t('login')}</Link>
              {onLogout && (
                <button onClick={onLogout} className="p-2 text-slate-400 hover:text-slate-900 transition-colors dark:hover:text-white">
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-4">
             <button 
                onClick={toggleTheme}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            <button 
                onClick={toggleLanguage} 
                className="flex items-center gap-2 p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors dark:border-slate-800 dark:hover:bg-slate-900"
              >
                <Globe className="w-4 h-4 text-slate-500" />
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 dark:text-slate-300">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass-card m-2 p-4 flex flex-col gap-4 dark:bg-slate-900/90"
        >
          <div className="flex justify-center py-2">
             <PWAInstallButton />
          </div>
          <Link to="/" className="px-4 py-2 hover:bg-slate-50 rounded-lg dark:hover:bg-slate-800">{t('home')}</Link>
          <Link to="/courses" className="px-4 py-2 hover:bg-slate-50 rounded-lg dark:hover:bg-slate-800">{t('courses')}</Link>
          <Link 
            to="/training-request" 
            className="mx-4 py-3 border-2 border-primary text-primary text-center rounded-xl font-bold hover:bg-primary hover:text-white transition-all"
          >
            {t('trainingRequest')}
          </Link>
          <Link to="/about" className="px-4 py-2 hover:bg-slate-50 rounded-lg dark:hover:bg-slate-800">{t('about')}</Link>
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="px-4 py-2 hover:bg-yellow-50 text-orange-600 font-bold bg-orange-50 rounded-lg dark:bg-orange-900/20 dark:hover:bg-orange-900/30 flex items-center gap-2"
          >
            <Headset size={18} /> {t('techSupport')}
          </button>
          <Link to="/login" className="mx-4 py-3 bg-primary text-white text-center rounded-xl font-bold shadow-lg shadow-primary/20 transition-all shiny-btn neon-hover-primary">{t('login')}</Link>
        </motion.div>
      )}
      <WhatsAppSupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </nav>
  );
};
