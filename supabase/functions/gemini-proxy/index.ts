import { GoogleGenAI, Modality, Type } from 'npm:@google/genai@0.14.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const body = await req.json();
    const { action, params } = body;

    const ai = new GoogleGenAI({ apiKey });

    let result;

    switch (action) {
      case 'generateContent': {
        const { model, contents, config } = params;
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });
        result = { text: response.text, candidates: response.candidates };
        break;
      }

      case 'generateImages': {
        const { model, prompt, config } = params;
        const response = await ai.models.generateImages({
          model,
          prompt,
          config,
        });
        result = { generatedImages: response.generatedImages };
        break;
      }

      case 'chat': {
        const { model, config, message } = params;
        const chat = ai.chats.create({ model, config });
        const response = await chat.sendMessage({ message });
        result = { text: response.text };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Gemini proxy error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});