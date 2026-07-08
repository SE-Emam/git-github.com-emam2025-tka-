import * as React from 'react';
import { GlassCard, GlassButton } from '@/src/components/common/Layout';
import { X, Maximize2, Mic, Video, Monitor } from 'lucide-react';

interface JitsiMeetingProps {
  roomName: string;
  userName: string;
  onClose?: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export const JitsiMeeting = ({ roomName, userName, onClose }: JitsiMeetingProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const apiRef = React.useRef<any>(null);

  React.useEffect(() => {
    const domain = 'meet.jit.si';
    
    // Load script if not already loaded
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = `https://${domain}/external_api.js`;
      script.async = true;
      script.onload = () => initMeeting();
      document.body.appendChild(script);
    } else {
      initMeeting();
    }

    function initMeeting() {
      if (!containerRef.current) return;

      const options = {
        roomName,
        width: '100%',
        height: '100%',
        parentNode: containerRef.current,
        userInfo: {
          displayName: userName
        },
        configOverwrite: {
          startWithAudioMuted: true,
          disableInviteFunctions: true
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
            'security'
          ],
        }
      };

      apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, [roomName, userName]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
      <GlassCard className="w-full h-full max-w-6xl max-h-[85vh] flex flex-col p-0 overflow-hidden" neon>
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
             </div>
             <div>
                <h3 className="font-bold text-sm tracking-tight">{roomName}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Live Learning Hub</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <GlassButton className="p-2 min-w-0" onClick={onClose} icon={X} variant="danger" />
          </div>
        </div>

        {/* Video Container */}
        <div ref={containerRef} className="flex-1 bg-black/40" />
      </GlassCard>
    </div>
  );
};
