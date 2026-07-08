import * as React from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useLanguage } from '@/src/context/LanguageContext';

export default function SecurityLayer({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const { t } = useLanguage();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent PrintScreen, Save (Ctrl+S), Print (Ctrl+P), Developer Tools (F12, Ctrl+Shift+I)
      // Mac shortcuts (Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5) are handled at the OS level and cannot be strictly blocked by JS,
      // but we try to catch them if possible.
      const isMacScreenshot = e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key);
      
      if (
        e.key === 'PrintScreen' || 
        (e.ctrlKey && e.key === 'p') || 
        (e.ctrlKey && e.key === 's') || 
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') || 
        isMacScreenshot
      ) {
        e.preventDefault();
        // Clear clipboard temporarily as a deterrent for simple PrintScreen
        navigator.clipboard.writeText(t('securityWatermark'));
        alert(t('securityAlert'));
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Block right-click
    };

    const handleCopyCut = (e: ClipboardEvent) => {
      e.preventDefault(); // Block copying
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault(); // Block dragging images
    };

    // Prevent content from being visible when window loses focus (Snipping tool active)
    const handleBlur = () => {
      document.body.style.filter = 'blur(10px)';
    };

    const handleFocus = () => {
      document.body.style.filter = 'none';
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyCut);
    document.addEventListener('cut', handleCopyCut);
    document.addEventListener('dragstart', handleDragStart);
    
    // Un-commenting blur on focus out can cause bad UX on mobile, keeping it disabled for now but available if requested.
    // window.addEventListener('blur', handleBlur);
    // window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyCut);
      document.removeEventListener('cut', handleCopyCut);
      document.removeEventListener('dragstart', handleDragStart);
      // window.removeEventListener('blur', handleBlur);
      // window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Show watermark for students and trial users
  const isStudent = profile?.role === 'student' || profile?.role === 'trial';
  const watermarkText = profile?.whatsappNumber || profile?.studentCode || profile?.email || 'TKA Student';

  return (
    <div className="relative w-full h-full select-none text-red" style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}>
      {children}
      
      {/* Dynamic Watermark Overlay - Psychological Deterrent */}
      {isStudent && profile && (
        <div className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.008] overflow-hidden flex flex-wrap justify-center items-center pointer-events-none select-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i} 
              className="transform -rotate-45 text-2xl font-black p-32 whitespace-nowrap text-slate-900 dark:text-white"
            >
              {watermarkText}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
