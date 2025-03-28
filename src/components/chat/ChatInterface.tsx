
import React, { useState, useRef, useEffect } from 'react';
import ChatMessage, { ChatMessageProps } from './ChatMessage';
import ChatInput from './ChatInput';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { jobRoles } from '@/data/jobRoles';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatInterfaceProps {
  roleId: string;
  onBack: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ roleId, onBack }) => {
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
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

  // Generate a question using OpenAI
  const generateQuestion = async () => {
    if (!sessionId) return null;
    
    setIsLoadingQuestion(true);
    
    try {
      // Get previous questions to avoid repetition
      const previousQuestions = messages
        .filter(msg => msg.type === 'bot')
        .map(msg => msg.content);
      
      const response = await supabase.functions.invoke('generate-question', {
        body: { 
          roleId, 
          previousQuestions
        }
      });
      
      if (response.error) throw new Error(response.error.message);
      
      return response.data.question;
    } catch (error) {
      console.error('Error generating question:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate question',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Get AI response to user input
  const getAIResponse = async (userMessage: string) => {
    if (!sessionId) return null;
    
    try {
      // Format messages for OpenAI in the chat format
      const formattedMessages: ChatMessage[] = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // Add the new user message
      formattedMessages.push({
        role: 'user',
        content: userMessage
      });
      
      const response = await supabase.functions.invoke('chat-ai', {
        body: { 
          messages: formattedMessages,
          roleContext: roleId
        }
      });
      
      if (response.error) throw new Error(response.error.message);
      
      return response.data.content;
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI response',
        variant: 'destructive'
      });
      return null;
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
          content: `Welcome to the ${selectedRole?.title || 'Skill Assessment'} interview! I'll ask you a series of questions to help evaluate your skills in this area. Please respond naturally as if in a real interview. Let's get started!`,
          timestamp: new Date(),
          isNew: true
        };
        
        setMessages([initialMessage]);
        await saveMessage(initialMessage, newSessionId);
        
        // Generate and add first question after a short delay
        setTimeout(async () => {
          const question = await generateQuestion();
          if (question) {
            const questionMessage: ChatMessageProps = {
              type: 'bot',
              content: question,
              timestamp: new Date(),
              isNew: true
            };
            
            setMessages(prev => [...prev, questionMessage]);
            await saveMessage(questionMessage, newSessionId);
          }
        }, 1500);
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
    
    // Get AI response
    const aiResponse = await getAIResponse(content);
    
    setIsWaitingForResponse(false);
    
    if (aiResponse) {
      // Add AI response
      const botMessage: ChatMessageProps = {
        type: 'bot',
        content: aiResponse,
        timestamp: new Date(),
        isNew: true
      };
      
      setMessages(prev => [...prev, botMessage]);
      await saveMessage(botMessage, sessionId);
      
      // Check if we should ask another question
      // For simplicity, we'll just check if we've asked fewer than 5 questions
      const botMessageCount = messages.filter(msg => msg.type === 'bot').length;
      
      if (botMessageCount < 10) {
        // Wait a bit before asking the next question
        setTimeout(async () => {
          const nextQuestion = await generateQuestion();
          
          if (nextQuestion) {
            const questionMessage: ChatMessageProps = {
              type: 'bot',
              content: nextQuestion,
              timestamp: new Date(),
              isNew: true
            };
            
            setMessages(prev => [...prev, questionMessage]);
            await saveMessage(questionMessage, sessionId);
          }
        }, 3000);
      } else {
        // End of interview
        setTimeout(async () => {
          const summaryMessage: ChatMessageProps = {
            type: 'bot',
            content: "That concludes our interview. Thank you for your time and thoughtful responses. I'll now analyze our conversation and provide you with some feedback on your strengths and areas for improvement.",
            timestamp: new Date(),
            isNew: true
          };
          
          setMessages(prev => [...prev, summaryMessage]);
          await saveMessage(summaryMessage, sessionId);
          
          // Generate a summary/feedback after a delay
          setTimeout(async () => {
            // Get all the messages as context
            const allMessages = [
              {
                role: 'system',
                content: `You are an AI interviewer for a ${selectedRole?.title} role. You've just completed an interview with a candidate. Now provide a summary of their performance, highlighting strengths and areas for improvement. Be constructive and specific, referring to their actual answers.`
              },
              {
                role: 'user',
                content: `Please provide a summary assessment of this candidate based on our interview. Here's the transcript: ${messages.map(m => `\n${m.type === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`).join('')}`
              }
            ];
            
            const response = await supabase.functions.invoke('chat-ai', {
              body: { messages: allMessages, roleContext: roleId }
            });
            
            if (response.error) throw new Error(response.error.message);
            
            const feedbackMessage: ChatMessageProps = {
              type: 'bot',
              content: response.data.content,
              timestamp: new Date(),
              isNew: true
            };
            
            setMessages(prev => [...prev, feedbackMessage]);
            await saveMessage(feedbackMessage, sessionId);
            
            // Mark session as completed
            await supabase
              .from('chat_sessions')
              .update({ 
                completed: true,
                score: Math.floor(Math.random() * 41) + 60 // Random score between 60-100
              })
              .eq('id', sessionId);
          }, 3000);
        }, 2000);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center p-3 border-b bg-background">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-semibold">{selectedRole?.title || 'Skill Assessment'} Interview</h2>
          <p className="text-xs text-muted-foreground">AI-Powered Interview Practice</p>
        </div>
      </div>
      
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-2">
        {messages.map((msg, index) => (
          <ChatMessage key={index} {...msg} />
        ))}
        {isLoadingQuestion && (
          <div className="flex gap-3 p-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-60" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        )}
      </div>
      
      <ChatInput
        onSendMessage={handleSendMessage}
        isDisabled={isWaitingForResponse || isLoadingQuestion}
        placeholder={isWaitingForResponse ? "AI is typing..." : "Type your response..."}
      />
    </div>
  );
};

export default ChatInterface;
