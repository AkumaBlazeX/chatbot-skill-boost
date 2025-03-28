
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import ChatMessage, { ChatMessageProps } from './ChatMessage';
import ChatInput from './ChatInput';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { questions } from '@/data/sampleQuestions';
import { jobRoles } from '@/data/jobRoles';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface ChatInterfaceProps {
  roleId: string;
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ roleId, onBack }) => {
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const roleQuestions = questions[roleId] || [];
  const selectedRole = jobRoles.find(role => role.id === roleId);

  // Create a new chat session
  const createSession = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          role_id: roleId,
          title: `${selectedRole?.title || 'Skill Assessment'} - ${new Date().toLocaleString()}`,
          completed: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data.id;
    } catch (error) {
      console.error('Error creating chat session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create chat session',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Save a message to the database
  const saveMessage = async (message: ChatMessageProps, session_id: string) => {
    if (!session_id) return;
    
    try {
      await supabase
        .from('chat_messages')
        .insert({
          session_id,
          content: message.content,
          is_user: message.type === 'user'
        });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  // Load messages for a session
  const loadMessages = async (session_id: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session_id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      const formattedMessages: ChatMessageProps[] = data.map(msg => ({
        type: msg.is_user ? 'user' : 'bot',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        isNew: false
      }));
      
      return formattedMessages;
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  };

  // Initialize the chat session
  useEffect(() => {
    const initSession = async () => {
      // Create a new session
      const newSessionId = await createSession();
      if (newSessionId) {
        setSessionId(newSessionId);
        
        // Add welcome message
        const initialMessage: ChatMessageProps = {
          type: 'bot',
          content: `Welcome to the ${selectedRole?.title || 'Skill Assessment'} session! I'll ask you a series of questions to help evaluate and improve your skills in this area. Let's get started!`,
          timestamp: new Date(),
          isNew: true
        };
        
        setMessages([initialMessage]);
        await saveMessage(initialMessage, newSessionId);
        
        // Add first question after a short delay
        setTimeout(async () => {
          if (roleQuestions.length > 0) {
            const questionMessage: ChatMessageProps = {
              type: 'bot',
              content: roleQuestions[0].text,
              timestamp: new Date(),
              isNew: true
            };
            
            setMessages(prev => [...prev, questionMessage]);
            await saveMessage(questionMessage, newSessionId);
          } else {
            const noQuestionMessage: ChatMessageProps = {
              type: 'bot',
              content: "I don't have any specific questions for this role yet, but you can ask me anything about it!",
              timestamp: new Date(),
              isNew: true
            };
            
            setMessages(prev => [...prev, noQuestionMessage]);
            await saveMessage(noQuestionMessage, newSessionId);
          }
        }, 1000);
      }
    };
    
    initSession();
  }, [roleId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const addBotMessage = async (content: string) => {
    if (!sessionId) return;
    
    const newMessage: ChatMessageProps = {
      type: 'bot',
      content,
      timestamp: new Date(),
      isNew: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    await saveMessage(newMessage, sessionId);
  };

  const handleSendMessage = async (content: string) => {
    if (!sessionId) return;
    
    // Add user message
    const userMessage: ChatMessageProps = {
      type: 'user',
      content,
      timestamp: new Date(),
      isNew: false
    };
    
    setMessages(prev => [...prev, userMessage]);
    await saveMessage(userMessage, sessionId);
    
    setIsWaitingForResponse(true);
    
    // Simulate AI thinking
    setTimeout(async () => {
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
        await addBotMessage(randomResponses[responseIndex]);
        
        // Then add the next question after a delay
        setTimeout(async () => {
          await addBotMessage(roleQuestions[nextIndex].text);
        }, 1500);
      } else {
        // End of questions
        await addBotMessage("Great job! You've completed all the questions. I'll prepare your skill assessment report shortly.");
        
        // Add a simulated report summary after delay
        setTimeout(async () => {
          await addBotMessage(`Based on our conversation, here's a brief assessment of your ${selectedRole?.title} skills:\n\n• You demonstrated good understanding of core concepts\n• Your communication is clear and professional\n• Consider exploring more advanced topics in ${selectedRole?.skills[0]} and ${selectedRole?.skills[1]}\n\nYou can view your detailed report in the dashboard when it's ready.`);
          
          // Mark session as completed
          try {
            await supabase
              .from('chat_sessions')
              .update({ 
                completed: true,
                score: Math.floor(Math.random() * 41) + 60 // Random score between 60-100
              })
              .eq('id', sessionId);
          } catch (error) {
            console.error('Error updating chat session:', error);
          }
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
