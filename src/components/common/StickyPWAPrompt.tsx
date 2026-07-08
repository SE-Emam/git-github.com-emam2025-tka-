import * as React from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/src/context/LanguageContext';
import PWAInstallButton from './PWAInstallButton';

export default function StickyPWAPrompt() {
  const [show, setShow] = React.useState(false);
  const { isRtl } = useLanguage();

  React.useEffect(() => {
    // Show after 3 seconds
    const timer = setTimeout(() => {
      // Only show if not already in standalone mode
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShow(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 z-[100] md:hidden"
        >
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-4 rounded-3xl shadow-2xl border border-primary/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                 <Sparkles className="text-primary w-6 h-6 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-slate-900 dark:text-white text-sm">TKA Egypt App</span>
                <span className="text-[10px] text-slate-500">
                  {isRtl ? 'ثبت التطبيق لتجربة أسرع ⚡' : 'Install for a faster experience ⚡'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <PWAInstallButton />
              <button 
                onClick={() => setShow(false)}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
