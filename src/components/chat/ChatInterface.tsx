
import React, { useState, useRef, useEffect } from 'react';
import ChatMessage, { ChatMessageProps } from './ChatMessage';
import ChatInput from './ChatInput';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { questions } from '@/data/sampleQuestions';
import { jobRoles } from '@/data/jobRoles';

interface ChatInterfaceProps {
  roleId: string;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ roleId, onBack }) => {
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const roleQuestions = questions[roleId] || [];
  const selectedRole = jobRoles.find(role => role.id === roleId);

  // Initial greeting message
  useEffect(() => {
    const initialMessages: ChatMessageProps[] = [
      {
        type: 'bot',
        content: `Welcome to the ${selectedRole?.title || 'Skill Assessment'} session! I'll ask you a series of questions to help evaluate and improve your skills in this area. Let's get started!`,
        timestamp: new Date(),
        isNew: false
      }
    ];
    
    setMessages(initialMessages);
    
    // Add first question after a short delay
    const timer = setTimeout(() => {
      if (roleQuestions.length > 0) {
        addBotMessage(roleQuestions[0].text);
      } else {
        addBotMessage("I don't have any specific questions for this role yet, but you can ask me anything about it!");
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [roleId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const addBotMessage = (content: string) => {
    setMessages(prev => [
      ...prev,
      {
        type: 'bot',
        content,
        timestamp: new Date(),
        isNew: true
      }
    ]);
  };

  const handleSendMessage = (content: string) => {
    // Add user message
    setMessages(prev => [
      ...prev,
      {
        type: 'user',
        content,
        timestamp: new Date(),
        isNew: false
      }
    ]);
    
    setIsWaitingForResponse(true);
    
    // Simulate AI thinking
    setTimeout(() => {
      setIsWaitingForResponse(false);
      
      // Move to next question if available
      const nextIndex = currentQuestionIndex + 1;
      
      if (nextIndex < roleQuestions.length) {
        setCurrentQuestionIndex(nextIndex);
        
        // First add a response to the user's answer
        const randomResponses = [
          "Thanks for your answer. Let's move on to the next question.",
          "Got it! That's an interesting perspective. Next question:",
          "I appreciate your response. Moving forward:"
        ];
        
        const responseIndex = Math.floor(Math.random() * randomResponses.length);
        addBotMessage(randomResponses[responseIndex]);
        
        // Then add the next question after a delay
        setTimeout(() => {
          addBotMessage(roleQuestions[nextIndex].text);
        }, 1500);
      } else {
        // End of questions
        addBotMessage("Great job! You've completed all the questions. I'll prepare your skill assessment report shortly.");
        
        // Add a simulated report summary after delay
        setTimeout(() => {
          addBotMessage(`Based on our conversation, here's a brief assessment of your ${selectedRole?.title} skills:\n\n• You demonstrated good understanding of core concepts\n• Your communication is clear and professional\n• Consider exploring more advanced topics in ${selectedRole?.skills[0]} and ${selectedRole?.skills[1]}\n\nYou can view your detailed report in the dashboard when it's ready.`);
        }, 3000);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center p-3 border-b bg-background">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-semibold">{selectedRole?.title || 'Skill Assessment'}</h2>
          <p className="text-xs text-muted-foreground">Powered by AI</p>
        </div>
      </div>
      
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-2">
        {messages.map((msg, index) => (
          <ChatMessage key={index} {...msg} />
        ))}
      </div>
      
      <ChatInput
        onSendMessage={handleSendMessage}
        isDisabled={isWaitingForResponse}
        placeholder={isWaitingForResponse ? "AI is typing..." : "Type your response..."}
      />
    </div>
  );
};

export default ChatInterface;
