import * as React from 'react';
import { Download, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/src/context/LanguageContext';

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [isInIframe, setIsInIframe] = React.useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = React.useState(false);
  const { isRtl } = useLanguage();

  React.useEffect(() => {
    // Detect iFrame
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If iOS and not installed, or if in iframe (to show help), we make it visible
    if ((isIOSDevice || isInIframe) && !window.matchMedia('(display-mode: standalone)').matches) {
        setIsVisible(true);
    }

    // In a normal browser (non-iOS, non-iframe), if prompt hasn't fired, we might still want to show "Help" 
    // but usually let's wait for the event for clean UX.
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
       setIsVisible(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isInIframe]);

  const handleInstallClick = async () => {
    if (isInIframe) {
      // In iframe, open in new window so user can install
      window.open(window.location.href, '_blank');
      return;
    }

    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      // If we don't have a prompt and it's not iOS/iFrame, maybe show general help
      alert(isRtl ? 'متصفحك قد لا يدعم التثبيت المباشر. جرب استخدام متصفح Chrome.' : 'Your browser might not support direct installation. Try using Chrome.');
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <AnimatePresence>
        <motion.button
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          onClick={handleInstallClick}
          className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 bg-gradient-to-r from-amber-400 via-gold to-amber-500 text-[#001d4a] rounded-2xl font-bold text-xs md:text-sm shadow-lg shadow-gold/40 border border-white/30 hover:scale-105 active:scale-95 transition-all shiny-btn group relative z-50"
        >
          <div className="bg-white/30 p-1 md:p-1.5 rounded-lg group-hover:rotate-12 transition-transform shrink-0">
              <Download size={16} className="md:w-[18px] md:h-[18px]" />
          </div>
          <div className="flex flex-col items-start leading-tight">
              <span className="text-[8px] md:text-[10px] uppercase opacity-80 flex items-center gap-1 font-black">
                  <Sparkles size={8} className="md:w-[10px] md:h-[10px]" /> 
                  {isInIframe ? (isRtl ? 'افتح للتثبيت' : 'Open to Install') : (isIOS ? 'iOS App' : 'Install App')}
              </span>
              <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-none font-bold">حمل تطبيق TKA-Egypt الان</span>
          </div>
        </motion.button>
      </AnimatePresence>

      <AnimatePresence>
        {showIOSInstructions && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 text-center"
            >
              <h3 className="text-xl font-black mb-4 dark:text-white">تثبيت التطبيق على آيفون</h3>
              <div className="space-y-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                <p>١. اضغط على أيقونة **المشاركة (Share)** في أسفل المتصفح.</p>
                <div className="flex justify-center py-2">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                  </div>
                </div>
                <p>٢. ابحث عن خيار **"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)**.</p>
                <p>٣. اضغط **"إضافة" (Add)** في الأعلى.</p>
              </div>
              <button 
                onClick={() => setShowIOSInstructions(false)}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20"
              >
                فهمت
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
