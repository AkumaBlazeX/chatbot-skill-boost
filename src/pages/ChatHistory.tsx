
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, CheckCircle, ArrowLeft, Star } from 'lucide-react';
import { jobRoles } from '@/data/jobRoles';

const ChatHistory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['chatSessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
  
  const getRoleIcon = (roleId: string) => {
    const role = jobRoles.find(r => r.id === roleId);
    return role?.icon || '📝';
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Your Assessment History</h1>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="h-[200px]">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map(session => {
            const role = jobRoles.find(r => r.id === session.role_id);
            
            return (
              <Card key={session.id} className="hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getRoleIcon(session.role_id)}</span>
                      <CardTitle>{role?.title || session.title}</CardTitle>
                    </div>
                    {session.completed && (
                      <div className="flex items-center text-amber-500">
                        <Star className="h-4 w-4 mr-1 fill-amber-500" />
                        <span className="font-semibold">{session.score || '?'}</span>
                      </div>
                    )}
                  </div>
                  <CardDescription className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(session.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm">
                    <span className={`mr-2 px-2 py-0.5 rounded-full text-xs ${
                      session.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {session.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // This would navigate to a detailed view in a real app
                      navigate(`/`);
                    }}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="mb-4 text-4xl">📊</div>
          <h3 className="text-xl font-semibold mb-2">No assessment history yet</h3>
          <p className="text-gray-600 mb-6">Complete your first skill assessment to see your results here.</p>
          <Button onClick={() => navigate('/')}>Start an Assessment</Button>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
