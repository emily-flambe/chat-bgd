# ChatBGD Architecture

## System Overview

ChatBGD is a minimal AI chat interface built as a Cloudflare Worker that serves embedded static assets and proxies API calls to the backend AI service.

## High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Browser  │    │   chat-bgd       │    │   ai-worker     │
│                 │    │   Worker         │    │   (Backend)     │
│                 │    │                  │    │                 │
│ chat.emily...   │◄──►│ Static Assets    │◄──►│ AI Service      │
│ cogsdill.com    │    │ API Proxy        │    │ Authentication  │
│                 │    │ Authentication   │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Component Architecture

### Frontend Layer (Static Assets)
- **Location**: `src/static/`
- **Components**:
  - `index.html` - Main chat interface
  - `styles.css` - UI styling and responsive design
  - `script.js` - Chat functionality and API communication
- **Build Process**: Assets are embedded into the worker via `build-static.js`
- **Delivery**: Served directly from Cloudflare edge locations

### Worker Layer (API & Asset Serving)
- **Location**: `src/index.ts`
- **Responsibilities**:
  - Serve embedded static assets
  - Proxy API calls to backend AI service
  - Handle authentication with service binding
  - Provide health check and debug endpoints
- **Service Binding**: Connected to `ai-worker` for backend communication

### Backend Integration
- **Service**: `ai-worker` (separate Cloudflare Worker)
- **Communication**: Via Cloudflare service binding
- **Authentication**: Server-side token (`CLOUDFLARE_AI_WORKER_API_TOKEN`)
- **API Endpoint**: `/api/v1/chat`

## Data Flow

### Chat Message Flow
1. **User Input**: User types message in chat interface
2. **Frontend Validation**: JavaScript validates message length and content
3. **API Call**: POST to `/api/chat` on chat-bgd worker
4. **Authentication**: Worker adds auth token and forwards to ai-worker
5. **AI Processing**: Backend processes message and generates response
6. **Response**: Response flows back through worker to frontend
7. **UI Update**: Chat interface updates with AI response

### Static Asset Flow
1. **Build Time**: `npm run build` embeds assets into `src/lib/static.ts`
2. **Request**: Browser requests static resources
3. **Worker Response**: Worker serves embedded assets directly
4. **CDN Caching**: Cloudflare CDN caches responses globally

## Technical Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with responsive design
- **Vanilla JavaScript**: No frameworks, minimal dependencies
- **Web APIs**: Fetch API, Event Listeners, DOM manipulation

### Worker Runtime
- **TypeScript**: Strict typing for reliability
- **Cloudflare Workers**: V8 isolate runtime
- **Service Bindings**: Inter-worker communication
- **Environment Variables**: Configuration management

### Development Tools
- **Wrangler**: Cloudflare CLI for development and deployment
- **TypeScript Compiler**: Type checking and compilation
- **Node.js**: Build script execution

## Deployment Architecture

### Production Environment
- **Domain**: `chat.emilycogsdill.com`
- **Worker Name**: `chat-bgd`
- **CDN**: Global Cloudflare network
- **Service Binding**: `ai-worker` connection
- **Secrets**: `CLOUDFLARE_AI_WORKER_API_TOKEN`

### Development Environment
- **Local Server**: `wrangler dev` on port 8787
- **Remote Backend**: Connects to deployed `ai-worker`
- **Hot Reloading**: Automatic rebuilds on static file changes
- **Environment File**: `.dev.vars` for local secrets

## Security Architecture

### Authentication Layer
- **Client-Side**: No API keys exposed to browser
- **Server-Side**: Worker handles all authentication
- **Token Management**: Secure storage via Wrangler secrets
- **Service Communication**: Encrypted inter-worker calls

### Input Validation
- **Client-Side**: Basic validation for UX
- **Server-Side**: Comprehensive validation in worker
- **Content Filtering**: Message length and content checks
- **Rate Limiting**: Cloudflare Workers built-in protection

## Performance Optimizations

### Asset Delivery
- **Embedded Assets**: No separate asset requests
- **Edge Caching**: Global CDN distribution
- **Minification**: Optimized JavaScript and CSS
- **Compression**: Automatic gzip/brotli compression

### API Efficiency
- **Service Bindings**: Direct worker-to-worker communication
- **Connection Pooling**: Efficient backend connections
- **Response Streaming**: Large responses streamed efficiently
- **Error Caching**: Prevents cascade failures

## Monitoring & Observability

### Built-in Endpoints
- **Health Check**: `/healthcheck` - Tests backend connectivity
- **Debug Info**: `/debug` - Environment and configuration status
- **Worker Logs**: Wrangler logging with structured output

### Error Handling
- **Frontend**: User-friendly error messages
- **Worker**: Comprehensive error logging
- **Backend**: Graceful fallback responses
- **Recovery**: Automatic retry logic where appropriate

## Scalability Considerations

### Current Limitations
- **Single Worker**: No horizontal scaling needed
- **Stateless**: Each request is independent
- **Backend Dependency**: Relies on ai-worker availability

### Future Scaling Options
- **Multiple Regions**: Deploy workers in specific regions
- **Load Balancing**: Cloudflare automatic load distribution
- **Caching**: Response caching for common queries
- **Rate Limiting**: Enhanced protection for high traffic

## Development Workflow

### Local Development
1. Install dependencies: `npm install`
2. Build static assets: `npm run build`
3. Start development server: `npm run dev`
4. Test at `http://localhost:8787`

### Deployment Process
1. Build assets: `npm run build`
2. Deploy worker: `wrangler deploy`
3. Verify deployment: Test at `chat.emilycogsdill.com`
4. Monitor logs: `wrangler tail`

---

*Architecture documentation for ChatBGD - Last updated: 2025-08-13*