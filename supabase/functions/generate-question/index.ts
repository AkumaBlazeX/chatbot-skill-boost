
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
    const { roleId, previousQuestions } = await req.json();
    
    const roleContext = getRoleContext(roleId);
    const previousQuestionsText = previousQuestions?.length > 0 
      ? `Previous questions asked: ${previousQuestions.join('. ')}` 
      : '';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are an AI interviewer for a ${roleContext.title} role. 
            Generate a relevant, challenging interview question to evaluate candidates.
            Create a question that tests knowledge of: ${roleContext.skills.join(', ')}.
            Generate a single direct question without any prefix or explanation.
            Your response should be just the question text.
            ${previousQuestionsText}`
          },
          { 
            role: 'user', 
            content: 'Generate a professional interview question for this role.'
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const question = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ question }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-question function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to get role context
function getRoleContext(roleId: string): { title: string, skills: string[] } {
  const roles = {
    'frontend-dev': {
      title: 'Front-End Developer',
      skills: ['HTML/CSS', 'JavaScript', 'React/Vue/Angular', 'Responsive Design', 'Web Performance', 'Accessibility']
    },
    'backend-dev': {
      title: 'Back-End Developer',
      skills: ['Server-side Languages', 'API Design', 'Database Management', 'Authentication', 'Performance Optimization', 'Security']
    },
    'qa-specialist': {
      title: 'QA Specialist',
      skills: ['Test Planning', 'Manual Testing', 'Automated Testing', 'Bug Reporting', 'Test Frameworks', 'Performance Testing']
    },
    'data-specialist': {
      title: 'Data Specialist',
      skills: ['Data Analysis', 'SQL', 'Data Visualization', 'ETL Processes', 'Statistical Analysis', 'Machine Learning Basics']
    }
  };
  
  return roles[roleId] || {
    title: 'Professional',
    skills: ['Communication', 'Problem-solving', 'Technical knowledge', 'Teamwork', 'Adaptability']
  };
}
