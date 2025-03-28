
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.3.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, roleContext } = await req.json();
    
    // Create system message based on role context
    const systemMessage = {
      role: 'system',
      content: `You are an AI interviewer for a ${roleContext || 'professional'} role. 
      Ask relevant questions to evaluate the candidate's skills and experience. 
      Provide constructive feedback on their answers. Be professional but friendly.
      Focus on skills like ${getRoleSkills(roleContext)}.`
    };
    
    // Add system message at the beginning if not already present
    const allMessages = messages.some(m => m.role === 'system') 
      ? messages 
      : [systemMessage, ...messages];
    
    console.log("Sending to OpenAI:", JSON.stringify(allMessages));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: allMessages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      content: aiResponse, 
      type: 'bot',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to get skills based on role
function getRoleSkills(roleId: string): string {
  const skillMap: Record<string, string> = {
    'frontend-dev': 'HTML, CSS, JavaScript, React, responsive design, web performance',
    'backend-dev': 'server-side languages, database management, API design, authentication, security',
    'qa-specialist': 'test planning, manual testing, automated testing, bug reporting, quality processes',
    'data-specialist': 'data analysis, SQL, visualization, statistical analysis, data processing'
  };
  
  return skillMap[roleId] || 'communication, problem-solving, technical knowledge';
}
