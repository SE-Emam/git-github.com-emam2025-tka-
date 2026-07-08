import * as React from 'react';
import { MessageSquare } from 'lucide-react';
const WhatsAppSupportModal = React.lazy(() => import('./WhatsAppSupportModal'));

export const WhatsAppSupportButton = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#25D366] rounded-full shadow-2xl flex items-center justify-center text-white z-50 hover:scale-110 transition-transform"
      >
        <MessageSquare size={28} />
      </button>
      {isOpen && (
        <React.Suspense fallback={null}>
          <WhatsAppSupportModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </React.Suspense>
      )}
    </>
  );
};
