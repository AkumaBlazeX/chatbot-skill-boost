
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export type MessageType = 'user' | 'bot' | 'system';

export interface ChatMessageProps {
  type: MessageType;
  content: string;
  timestamp?: Date;
  isNew?: boolean;
  avatarUrl?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  type,
  content,
  timestamp = new Date(),
  isNew = false,
  avatarUrl
}) => {
  const [displayContent, setDisplayContent] = useState<string>(isNew ? '' : content);
  const [isTyping, setIsTyping] = useState<boolean>(isNew && type === 'bot');
  const [charIndex, setCharIndex] = useState<number>(0);

  useEffect(() => {
    if (isNew && type === 'bot') {
      const interval = setInterval(() => {
        if (charIndex < content.length) {
          setDisplayContent(content.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 20); // Adjust typing speed here
      
      return () => clearInterval(interval);
    } else {
      setDisplayContent(content);
    }
  }, [isNew, content, charIndex, type]);

  return (
    <div
      className={cn(
        "flex gap-3 p-4 message-appear",
        type === 'user' ? "justify-end" : "justify-start",
        type === 'system' && "justify-center"
      )}
    >
      {type !== 'user' && type !== 'system' && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-3",
          type === 'user' 
            ? "bg-brand-500 text-white" 
            : type === 'system' 
              ? "bg-muted text-muted-foreground text-sm" 
              : "bg-secondary"
        )}
      >
        <div className="whitespace-pre-wrap">
          {displayContent}
          {isTyping && (
            <span className="typing-dots ml-1">
              <span className="animate-dot-flashing"></span>
              <span className="animate-dot-flashing"></span>
              <span className="animate-dot-flashing"></span>
            </span>
          )}
        </div>
        
        {timestamp && (
          <div className={cn(
            "text-xs mt-1",
            type === 'user' ? "text-brand-100" : "text-muted-foreground"
          )}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
      
      {type === 'user' && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-brand-200 text-brand-700">U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
