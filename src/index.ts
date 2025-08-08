/**
 * ChatBGD - Cloudflare Worker Entry Point
 * Serves the chat interface and proxies API calls with server-side authentication
 */

import { staticAssets } from './lib/static';

export interface Env {
  ANALYTICS?: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Debug endpoint to check environment access
    if (path === '/debug' && request.method === 'GET') {
      return new Response(JSON.stringify({
        domain: url.hostname,
        allEnvKeys: Object.keys(env || {}),
        timestamp: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Handle chat API requests
    if (path === '/api/chat' && request.method === 'POST') {
      return handleChatRequest(request, env);
    }

    // Serve static assets
    try {
      const asset = getStaticAsset(path);
      if (asset) {
        return new Response(asset.content, {
          headers: {
            'Content-Type': asset.contentType,
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Default to serving the main HTML page
      const htmlAsset = staticAssets['/index.html'];
      if (htmlAsset) {
        return new Response(htmlAsset, {
          headers: {
            'Content-Type': 'text/html; charset=UTF-8',
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

/**
 * Handle chat API requests by proxying to the AI worker
 */
async function handleChatRequest(request: Request, env: Env): Promise<Response> {
  try {
    const requestUrl = new URL(request.url);
    console.log('🔍 Chat Request Debug:', {
      domain: requestUrl.hostname,
      timestamp: new Date().toISOString()
    });

    // Parse the request body
    const body = await request.json();
    const { message } = body;

    // Validate the message
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: message is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    if (message.length > 4000) {
      return new Response(
        JSON.stringify({ error: 'Message too long. Maximum 4000 characters.' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Call the new AI API endpoint
    console.log('🔍 Making AI service call:', {
      domain: requestUrl.hostname,
      url: 'https://ai-worker.emily-cogsdill.workers.dev/api/v1/chat'
    });
    
    const aiResponse = await fetch('https://ai-worker.emily-cogsdill.workers.dev/api/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: message,
        model: '@cf/openai/gpt-oss-20b'
      }),
    });

    console.log('🔍 AI service response:', {
      domain: requestUrl.hostname,
      status: aiResponse.status,
      statusText: aiResponse.statusText,
      ok: aiResponse.ok
    });

    // Handle AI worker response
    if (!aiResponse.ok) {
      let errorMessage = 'AI service temporarily unavailable';
      
      if (aiResponse.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment.';
      } else if (aiResponse.status >= 500) {
        errorMessage = 'AI service error. Please try again later.';
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: aiResponse.status === 429 ? 429 : 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Forward the AI response
    const aiData = await aiResponse.json();
    
    // Extract the actual text response from the complex structure
    let responseText = 'No response received';
    if (aiData.output && Array.isArray(aiData.output)) {
      // Look for the assistant message in the output array
      const assistantMessage = aiData.output.find(item => 
        item.type === 'message' && item.role === 'assistant'
      );
      if (assistantMessage && assistantMessage.content && Array.isArray(assistantMessage.content)) {
        const textContent = assistantMessage.content.find(content => content.type === 'output_text');
        if (textContent && textContent.text) {
          responseText = textContent.text;
        }
      }
    }
    
    return new Response(JSON.stringify({ response: responseText }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Chat request error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

/**
 * Get static asset by path
 */
function getStaticAsset(path: string): { content: string; contentType: string } | null {
  // Normalize path
  if (path === '/' || path === '') {
    path = '/index.html';
  }

  const asset = staticAssets[path];
  if (!asset) {
    return null;
  }

  // Determine content type
  let contentType = 'text/plain';
  if (path.endsWith('.html')) {
    contentType = 'text/html; charset=UTF-8';
  } else if (path.endsWith('.css')) {
    contentType = 'text/css; charset=UTF-8';
  } else if (path.endsWith('.js')) {
    contentType = 'application/javascript; charset=UTF-8';
  } else if (path.endsWith('.json')) {
    contentType = 'application/json; charset=UTF-8';
  }

  return {
    content: asset,
    contentType,
  };
}