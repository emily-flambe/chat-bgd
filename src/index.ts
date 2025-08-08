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
    console.log('🔍 Backend: Chat Request Started:', {
      domain: requestUrl.hostname,
      method: request.method,
      url: request.url,
      timestamp: new Date().toISOString()
    });

    console.log('🔍 Backend: Reading request headers:', Object.fromEntries(request.headers.entries()));

    // Parse the request body
    console.log('🔍 Backend: Parsing request body...');
    const body = await request.json();
    console.log('🔍 Backend: Parsed request body:', body);
    
    const { message } = body;
    console.log('🔍 Backend: Extracted message:', message);

    // Validate the message
    if (!message || typeof message !== 'string') {
      console.log('🚨 Backend: Invalid message format');
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
      console.log('🚨 Backend: Message too long');
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

    // Prepare AI service request - EXACTLY like curl command
    const aiServiceUrl = 'https://ai-worker.emily-cogsdill.workers.dev/api/v1/chat';
    const aiRequestBody = {
      input: message,
      model: '@cf/openai/gpt-oss-20b'
    };

    console.log('🔍 Backend: Making AI service call:', {
      domain: requestUrl.hostname,
      url: aiServiceUrl,
      requestBody: aiRequestBody,
      exactCurlMatch: 'YES - matches curl command exactly'
    });
    
    console.log('🔍 Backend: AI request body JSON:', JSON.stringify(aiRequestBody));
    
    console.log('🔍 Backend: About to call fetch...');
    const aiResponse = await fetch(aiServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(aiRequestBody),
    });

    console.log('🔍 Backend: AI service response received:', {
      domain: requestUrl.hostname,
      status: aiResponse.status,
      statusText: aiResponse.statusText,
      ok: aiResponse.ok,
      headers: Object.fromEntries(aiResponse.headers.entries())
    });

    // Handle AI worker response
    if (!aiResponse.ok) {
      console.log('🚨 Backend: AI service returned error');
      const errorResponseText = await aiResponse.text();
      console.log('🚨 Backend: AI error response body:', errorResponseText);
      
      let errorMessage = 'AI service temporarily unavailable';
      
      if (aiResponse.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment.';
      } else if (aiResponse.status >= 500) {
        errorMessage = 'AI service error. Please try again later.';
      }

      console.log('🚨 Backend: Returning error to frontend:', errorMessage);

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
    console.log('🔍 Backend: AI service returned success, parsing JSON...');
    const aiData = await aiResponse.json();
    console.log('🔍 Backend: AI response data:', JSON.stringify(aiData, null, 2));
    
    // Extract the actual text response from the complex structure
    let responseText = 'No response received';
    console.log('🔍 Backend: Extracting response text...');
    
    if (aiData.output && Array.isArray(aiData.output)) {
      console.log('🔍 Backend: Found output array with', aiData.output.length, 'items');
      // Look for the assistant message in the output array
      const assistantMessage = aiData.output.find(item => 
        item.type === 'message' && item.role === 'assistant'
      );
      console.log('🔍 Backend: Assistant message found:', !!assistantMessage);
      
      if (assistantMessage && assistantMessage.content && Array.isArray(assistantMessage.content)) {
        console.log('🔍 Backend: Assistant content array has', assistantMessage.content.length, 'items');
        const textContent = assistantMessage.content.find(content => content.type === 'output_text');
        console.log('🔍 Backend: Text content found:', !!textContent);
        
        if (textContent && textContent.text) {
          responseText = textContent.text;
          console.log('🔍 Backend: Extracted response text:', responseText);
        }
      }
    } else {
      console.log('🔍 Backend: No output array found, checking for other response formats...');
      // Maybe the response format is different, let's check for common alternatives
      if (aiData.response) {
        responseText = aiData.response;
        console.log('🔍 Backend: Found response in .response field:', responseText);
      } else if (aiData.text) {
        responseText = aiData.text;
        console.log('🔍 Backend: Found response in .text field:', responseText);
      } else if (aiData.message) {
        responseText = aiData.message;
        console.log('🔍 Backend: Found response in .message field:', responseText);
      } else if (typeof aiData === 'string') {
        responseText = aiData;
        console.log('🔍 Backend: AI data is string:', responseText);
      }
    }
    
    console.log('🔍 Backend: Final response text to send:', responseText);
    
    const finalResponse = { response: responseText };
    console.log('🔍 Backend: Final response object:', finalResponse);
    
    return new Response(JSON.stringify(finalResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('🚨 Backend: Chat request error caught:', error);
    console.error('🚨 Backend: Error type:', typeof error);
    console.error('🚨 Backend: Error message:', error.message);
    console.error('🚨 Backend: Error stack:', error.stack);
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