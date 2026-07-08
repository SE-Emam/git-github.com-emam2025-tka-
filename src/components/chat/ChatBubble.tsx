import * as React from 'react';
import { cn } from '@/src/lib/utils';

interface ChatBubbleProps {
  content: string;
  isOwn: boolean;
  senderName: string;
  key?: React.Key;
}

export default function ChatBubble({ content, isOwn, senderName }: ChatBubbleProps) {
  const isImage = content.startsWith('https://firebasestorage.googleapis.com');

  return (
    <div className={cn("flex flex-col gap-1 mb-4", isOwn ? "items-end" : "items-start")}>
      {!isOwn && <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">{senderName}</span>}
      <div className={cn(
        "max-w-[70%] px-4 py-3 rounded-2xl text-sm overflow-hidden",
        isOwn 
          ? "bg-primary text-white rounded-br-none" 
          : "bg-slate-100 text-slate-800 rounded-bl-none dark:bg-slate-800 dark:text-slate-200"
      )}>
        {isImage ? (
          <img src={content} alt="Chat" className="w-full h-auto rounded-lg" referrerPolicy="no-referrer" />
        ) : (
          content
        )}
      </div>
    </div>
  );
}
