# ChatBGD Coding Standards

## TypeScript Standards

### Code Style
- **Strict Mode**: Always use TypeScript strict mode
- **Type Safety**: Explicit types for all public interfaces
- **Naming**: camelCase for variables, PascalCase for types
- **Imports**: Use explicit imports, avoid default exports where possible

### Example Patterns
```typescript
// ✅ Good: Explicit interface definition
export interface Env {
  ANALYTICS?: KVNamespace;
  AI_WORKER: Fetcher;
}

// ✅ Good: Proper error handling
try {
  const response = await env.AI_WORKER.fetch(request);
  if (!response.ok) {
    throw new Error(`AI service error: ${response.status}`);
  }
  return response;
} catch (error) {
  console.error('API Error:', error);
  return new Response('Service unavailable', { status: 503 });
}

// ❌ Avoid: Any types without justification
const data: any = response.json();

// ✅ Better: Proper typing
interface ChatResponse {
  response: string;
  error?: string;
}
const data: ChatResponse = await response.json();
```

## Worker Development Standards

### Request Handling
- **URL Parsing**: Use `new URL(request.url)` for path handling
- **Method Checking**: Explicit HTTP method validation
- **CORS**: Proper headers for cross-origin requests
- **Error Responses**: Consistent error response format

### Example Worker Patterns
```typescript
// ✅ Good: Structured request handling
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Route handling
    if (path === '/api/chat' && request.method === 'POST') {
      return handleChatRequest(request, env);
    }

    if (path === '/healthcheck' && request.method === 'GET') {
      return handleHealthCheck(env);
    }

    // Static asset serving
    return serveStaticAsset(path);
  }
};

// ✅ Good: Consistent error responses
function errorResponse(message: string, status: number = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

### Environment Handling
- **Type Safety**: All environment variables properly typed
- **Fallbacks**: Graceful handling of missing variables
- **Secrets**: Never log or expose sensitive values

## Frontend Standards (Static Assets)

### HTML Standards
- **Semantic Markup**: Use appropriate HTML5 elements
- **Accessibility**: Include ARIA labels and keyboard navigation
- **Meta Tags**: Proper viewport and character encoding
- **Performance**: Minimize DOM structure

### Example HTML Patterns
```html
<!-- ✅ Good: Semantic, accessible structure -->
<main class="chat-container" role="main">
  <section class="chat-messages" aria-live="polite" aria-label="Chat messages">
    <!-- Messages populated by JavaScript -->
  </section>
  
  <form class="chat-input-form" aria-label="Send message">
    <label for="message-input" class="sr-only">Type your message</label>
    <textarea 
      id="message-input" 
      placeholder="Type your message... (Shift+Enter for new line)"
      maxlength="4000"
      aria-describedby="char-counter"
      required>
    </textarea>
    <div id="char-counter" class="char-counter" aria-live="polite">0/4000</div>
    <button type="submit" aria-label="Send message">Send</button>
  </form>
</main>
```

### CSS Standards
- **Modern CSS**: Use CSS Grid and Flexbox for layouts
- **Responsive Design**: Mobile-first approach
- **Custom Properties**: Use CSS variables for theming
- **Performance**: Minimize reflows and repaints

### Example CSS Patterns
```css
/* ✅ Good: CSS custom properties for theming */
:root {
  --primary-color: #007bff;
  --bg-color: #f8f9fa;
  --text-color: #333;
  --border-radius: 8px;
  --spacing-unit: 1rem;
}

/* ✅ Good: Mobile-first responsive design */
.chat-container {
  display: grid;
  grid-template-rows: 1fr auto;
  height: 100vh;
  max-width: 100%;
  margin: 0 auto;
  padding: var(--spacing-unit);
}

@media (min-width: 768px) {
  .chat-container {
    max-width: 800px;
    padding: calc(var(--spacing-unit) * 2);
  }
}

/* ✅ Good: Accessible focus styles */
button:focus,
textarea:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
```

### JavaScript Standards
- **Vanilla JS**: No frameworks, minimal dependencies
- **Event Handling**: Proper event delegation and cleanup
- **Error Handling**: User-friendly error messages
- **Performance**: Debounced input handling, efficient DOM updates

### Example JavaScript Patterns
```javascript
// ✅ Good: Structured application initialization
class ChatApp {
  constructor() {
    this.messageInput = document.getElementById('message-input');
    this.chatMessages = document.querySelector('.chat-messages');
    this.charCounter = document.getElementById('char-counter');
    
    this.initializeEventListeners();
    this.focusInput();
  }

  initializeEventListeners() {
    // Form submission
    document.querySelector('.chat-input-form')
      .addEventListener('submit', this.handleSubmit.bind(this));
    
    // Input character counting
    this.messageInput.addEventListener('input', 
      this.debounce(this.updateCharCounter.bind(this), 100));
  }

  // ✅ Good: Proper async error handling
  async sendMessage(message) {
    try {
      this.setLoadingState(true);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      this.displayMessage(data.response, 'assistant');
      
    } catch (error) {
      console.error('Chat error:', error);
      this.displayError('Sorry, there was an error processing your message.');
    } finally {
      this.setLoadingState(false);
    }
  }

  // ✅ Good: Debouncing for performance
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  new ChatApp();
});
```

## Build System Standards

### Build Script Patterns
- **File Embedding**: Proper encoding for binary assets
- **Error Handling**: Clear error messages for build failures
- **Output Validation**: Verify generated code is valid

### Example Build Patterns
```javascript
// ✅ Good: Robust file processing
function embedStaticAssets() {
  const assets = {};
  const staticDir = path.join(__dirname, 'src/static');
  
  try {
    const files = fs.readdirSync(staticDir);
    
    files.forEach(file => {
      const filePath = path.join(staticDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Validate content
      if (file.endsWith('.html') && !content.includes('<!DOCTYPE html>')) {
        throw new Error(`Invalid HTML in ${file}: Missing DOCTYPE`);
      }
      
      assets[file] = content;
    });
    
    return assets;
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}
```

## Testing Standards

### API Testing
- **Health Checks**: Verify all endpoints respond correctly
- **Error Cases**: Test invalid inputs and error conditions
- **Authentication**: Verify security mechanisms work

### Frontend Testing
- **Manual Testing**: Test keyboard shortcuts and accessibility
- **Cross-Browser**: Verify compatibility across major browsers
- **Mobile Testing**: Test responsive design on devices

## Performance Standards

### Bundle Size
- **Minimal Dependencies**: Avoid unnecessary libraries
- **Asset Optimization**: Compress and minify all assets
- **Code Splitting**: Separate static assets from logic

### Runtime Performance
- **Efficient DOM Updates**: Minimize reflows and repaints
- **Memory Management**: Clean up event listeners
- **Network Efficiency**: Batch API calls where possible

## Security Standards

### Input Validation
- **Client-Side**: Basic validation for UX
- **Server-Side**: Comprehensive validation for security
- **Sanitization**: Escape user input in displays

### Authentication
- **No Client Secrets**: All sensitive data server-side only
- **Token Security**: Proper token storage and rotation
- **HTTPS Only**: All communications encrypted

## Documentation Standards

### Code Comments
- **Complex Logic**: Explain non-obvious implementations
- **API Interfaces**: Document expected inputs/outputs
- **Security Considerations**: Note security-relevant code

### Example Documentation
```typescript
/**
 * Proxies chat requests to the AI backend service
 * 
 * @param request - POST request with JSON body containing message
 * @param env - Worker environment with AI_WORKER binding
 * @returns Response with AI-generated chat response
 * 
 * Security: Adds server-side authentication token before forwarding
 * Error handling: Returns user-friendly errors for all failure cases
 */
async function handleChatRequest(request: Request, env: Env): Promise<Response> {
  // Implementation...
}
```

---

*Coding standards for ChatBGD - Last updated: 2025-08-13*