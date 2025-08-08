# ChatBGD Web App - Comprehensive Specification

## Project Overview

**ChatBGD** is a minimal, production-ready web interface for AI chat interactions, designed to be "AS SIMPLE AS POSSIBLE" while supporting both local development and Cloudflare Worker deployment to `chat.emilycogsdill.com`.

### Core Philosophy
- **Extreme Simplicity**: Minimal dependencies, clean codebase, zero overengineering
- **Dual Deployment**: Works both as standalone HTML and Cloudflare Worker
- **Production Ready**: Authentication, rate limiting, error handling
- **Developer Friendly**: Easy local development, clear deployment path

### Production Deployment Target
- **Worker Name**: `chat-gbd` (Cloudflare Worker)
- **Production URL**: `https://chat.emilycogsdill.com`
- **Environment**: Production only (no dev/staging workers)
- **Custom Domain**: Configured via Cloudflare Dashboard

## Architecture Decisions

### API Integration
**Backend**: Existing Cloudflare AI Worker at `ai.emilycogsdill.com`
- **Endpoint**: `POST /api/v1/chat`  
- **Current API**: `{message: string, systemPrompt?: string}`
- **Authentication**: Bearer token via `Authorization` header

### Critical API Mismatch Discovery
The initial CHATGBD.md design expects:
```json
{
  "message": "user message",
  "model": "@cf/openai/gpt-oss-120b", 
  "reasoning_effort": "medium"
}
```

However, the actual AI worker `/api/v1/chat` endpoint only accepts:
```json
{
  "message": "user message",
  "systemPrompt": "optional system prompt"
}
```

**Resolution**: Frontend will use the actual API format. Model selection and reasoning effort will be removed from initial implementation (can be added to AI worker later if needed).

## Project Structure

### Option A: Single File Deployment (Ultra-Simple)
```
chat-bgd/
├── chat.html                 # Complete standalone app
└── README.md                 # Usage instructions
```

### Option B: Cloudflare Worker Deployment (Production)
**Worker Name**: `chat-gbd`  
**Production URL**: `https://chat.emilycogsdill.com`

```
chat-bgd/
├── .specs/
│   └── chat-bgd-web-app.md    # This spec
├── src/
│   ├── index.ts               # Worker entry point
│   ├── static/
│   │   ├── index.html         # Chat interface
│   │   ├── styles.css         # UI styling
│   │   └── script.js          # Chat logic
│   └── lib/
│       └── static.ts          # Embedded static assets (generated)
├── package.json               # Dependencies and scripts
├── wrangler.toml             # Cloudflare Worker config (chat-gbd worker)
├── tsconfig.json             # TypeScript config
├── build-static.js           # Static asset embedding script
└── README.md                 # Project documentation
```

## Technical Specifications

### Frontend Requirements
- **Framework**: Vanilla JavaScript (no frameworks)
- **Styling**: Embedded CSS with clean, modern design
- **Responsive**: Mobile-friendly interface
- **Accessibility**: Basic ARIA labels, keyboard navigation
- **Browser Support**: Modern browsers (ES6+)

### UI Components
1. **Header Bar**
   - Project title
   - API key input (password field, localStorage persistence)
   - Connection status indicator

2. **Chat Area** 
   - Message history with user/assistant distinction
   - Auto-scroll to latest message
   - Loading indicators during API calls
   - Error message display

3. **Input Area**
   - Auto-expanding textarea
   - Send button with loading state
   - Enter to send, Shift+Enter for new line
   - Character count display

### Backend Integration
- **Authentication**: Bearer token from user-provided API key
- **Error Handling**: Network errors, API errors, validation errors
- **Rate Limiting**: Respect backend rate limits, show user feedback
- **CORS**: Handle cross-origin requests properly

## Deployment Options

### Option A: Single HTML File
**Pros:**
- Zero build process
- Works anywhere (local files, any web host)
- Perfect for personal use
- Under 10KB total size

**Cons:**
- No server-side features
- Limited to browser CORS policies
- No custom domain routing

**Use Cases:**
- Personal productivity tool
- Quick prototyping
- Offline-capable interface

### Option B: Cloudflare Worker
**Pros:**
- Custom domain support
- Server-side asset optimization
- Better CORS handling
- Analytics and monitoring
- CDN delivery worldwide

**Cons:**
- Build process required
- Cloudflare account needed
- More complex deployment

**Use Cases:**
- Production deployment at `chat.emilycogsdill.com`
- Public-facing application
- Team/organization use

**Deployment Details:**
- **Worker Name**: `chat-gbd`
- **Custom Domain**: `chat.emilycogsdill.com`
- **Routes**: `chat.emilycogsdill.com/*`

## Implementation Phases

### Phase 1: Core Chat Interface
**Duration**: 1-2 hours
**Deliverables**:
- Working chat interface with AI API integration
- API key management and persistence
- Basic error handling and loading states
- Responsive design for mobile/desktop

**Features**:
- Send/receive messages
- API key input and storage
- Loading indicators
- Basic error messages
- Auto-scroll chat history

### Phase 2: Enhanced UX
**Duration**: 1 hour
**Deliverables**:
- Improved visual design
- Better error handling
- Connection status indicators
- Message formatting improvements

**Features**:
- Markdown rendering for AI responses
- Copy message functionality
- Clear chat history button
- Improved loading animations
- Better error message UX

### Phase 3: Dual Deployment
**Duration**: 1-2 hours  
**Deliverables**:
- Cloudflare Worker version
- Build and deployment scripts
- Documentation for both deployment methods

**Features**:
- Static asset embedding
- Worker routing
- Build process automation
- Deploy scripts and documentation

## API Integration Details

### Request Format
```typescript
interface ChatRequest {
  message: string;           // User message (max 4000 chars)
  systemPrompt?: string;     // Optional system prompt override
}
```

### Response Format
```typescript
interface ChatResponse {
  response: string;          // AI response text
  error?: string;           // Error message if request failed
}
```

### Authentication
```javascript
const headers = {
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json'
};
```

### Error Handling
- **Network Errors**: "Connection failed. Check your internet connection."
- **Auth Errors**: "Invalid API key. Please check your credentials."
- **Rate Limit**: "Too many requests. Please wait a moment."
- **API Errors**: Display specific error message from response

## Security Considerations

### Client-Side Security
- API keys stored in localStorage (user responsibility)
- No sensitive data logging in console
- Basic XSS prevention in message display
- HTTPS-only API calls

### Rate Limiting
- Respect backend rate limits
- Show user feedback when rate limited
- Implement client-side request throttling

### Content Security
- Sanitize displayed messages
- Prevent code injection through chat messages
- Safe handling of HTML/Markdown in responses

## Performance Requirements

### Load Time
- **Single HTML**: < 1 second load time
- **Worker Version**: < 2 second initial load
- **Chat Response**: < 5 second API response time

### Bundle Size
- **HTML Version**: < 15KB total
- **Worker Version**: < 50KB total bundle

### Runtime Performance
- Smooth scrolling in chat area
- No UI blocking during API calls
- Responsive input during message typing

## Testing Strategy

### Manual Testing Checklist
- [ ] API key validation and storage
- [ ] Send/receive messages successfully
- [ ] Error handling for network failures
- [ ] Error handling for API errors
- [ ] Mobile responsive design
- [ ] Keyboard shortcuts (Enter, Shift+Enter)
- [ ] Auto-scroll functionality
- [ ] Loading state indicators

### Browser Testing
- Chrome/Chromium (primary)
- Safari (iOS compatibility)
- Firefox (standards compliance)
- Mobile browsers (responsive design)

## Future Enhancements (Post-MVP)

### Potential Features
1. **Message Export**: Download chat history as JSON/text
2. **Multiple Conversations**: Tab-based conversation management  
3. **Message Templates**: Saved prompt templates
4. **Dark Mode**: Theme switching capability
5. **Keyboard Shortcuts**: Advanced hotkey support

### API Enhancements (Backend)
1. **Model Selection**: Support multiple AI models
2. **Reasoning Effort**: Configurable response quality/speed
3. **Conversation Context**: Multi-turn conversation memory
4. **File Uploads**: Image and document processing

## Success Metrics

### Primary Goals
- ✅ Functional chat interface in < 2 hours development time
- ✅ Works in both single-file and Worker deployment modes
- ✅ Under 15KB for HTML version
- ✅ Professional-quality UX despite minimal complexity

### Quality Gates
- All basic functionality works without errors
- Mobile-friendly responsive design
- Professional visual appearance
- Clear error messages and loading states
- Documented deployment for both options

## Resource Requirements

### Development Time
- **Total**: 4-5 hours for complete implementation
- **MVP**: 2-3 hours for basic working version
- **Polish**: 1-2 hours for enhanced UX and deployment

### External Dependencies
- Cloudflare account (for Worker deployment)
- API key from existing AI worker service
- Modern web browser for development/testing

---

## Implementation Todo List

### Phase 1: Core Chat Interface (Priority 1)

#### Setup & Structure
- [ ] **P1.1**: Create basic project structure (package.json, README.md)
- [ ] **P1.2**: Set up TypeScript configuration (tsconfig.json)
- [ ] **P1.3**: Configure Wrangler for `chat-gbd` worker at `chat.emilycogsdill.com` (wrangler.toml)
- [ ] **P1.4**: Create build script for static asset embedding (build-static.js)

#### Single HTML Version (Option A)
- [ ] **P1.5**: Create standalone chat.html with embedded CSS/JS
- [ ] **P1.6**: Implement chat UI components (header, messages, input)
- [ ] **P1.7**: Add API key input with localStorage persistence
- [ ] **P1.8**: Implement core chat functionality (send/receive messages)
- [ ] **P1.9**: Add loading states and error handling
- [ ] **P1.10**: Test API integration with ai.emilycogsdill.com
- [ ] **P1.11**: Implement responsive design for mobile devices
- [ ] **P1.12**: Add keyboard shortcuts (Enter to send, Shift+Enter for newline)

#### Cloudflare Worker Version (Option B)
- [ ] **P1.13**: Create Worker entry point (src/index.ts)
- [ ] **P1.14**: Set up static asset serving with CORS
- [ ] **P1.15**: Create separate HTML/CSS/JS files in src/static/
- [ ] **P1.16**: Implement static asset embedding system
- [ ] **P1.17**: Configure build process and development workflow
- [ ] **P1.18**: Test local development with `npm run dev`
- [ ] **P1.19**: Test deployment to `chat-gbd` worker at `chat.emilycogsdill.com`

### Phase 2: Enhanced UX (Priority 2)

#### Visual Polish
- [ ] **P2.1**: Implement modern, clean UI design
- [ ] **P2.2**: Add connection status indicators
- [ ] **P2.3**: Improve loading animations and transitions
- [ ] **P2.4**: Add message timestamp display
- [ ] **P2.5**: Implement auto-scroll with smooth scrolling

#### Functionality Enhancements
- [ ] **P2.6**: Add clear chat history functionality
- [ ] **P2.7**: Implement copy message to clipboard
- [ ] **P2.8**: Add character count for message input
- [ ] **P2.9**: Improve error message display and UX
- [ ] **P2.10**: Add message formatting (preserve line breaks)

#### Robustness
- [ ] **P2.11**: Implement retry logic for failed API calls
- [ ] **P2.12**: Add client-side rate limiting feedback
- [ ] **P2.13**: Improve input validation and sanitization
- [ ] **P2.14**: Add offline detection and messaging

### Phase 3: Production Polish (Priority 3)

#### Testing & Quality
- [ ] **P3.1**: Cross-browser testing (Chrome, Safari, Firefox)
- [ ] **P3.2**: Mobile device testing (iOS Safari, Chrome Mobile)
- [ ] **P3.3**: Accessibility testing and ARIA label improvements
- [ ] **P3.4**: Performance optimization and bundle size review
- [ ] **P3.5**: Security review for XSS and input handling

#### Documentation
- [ ] **P3.6**: Write comprehensive README.md
- [ ] **P3.7**: Document deployment procedures for both options
- [ ] **P3.8**: Create usage guide with screenshots
- [ ] **P3.9**: Document API integration and troubleshooting

#### Deployment Infrastructure
- [ ] **P3.10**: Set up development/staging environments
- [ ] **P3.11**: Configure production deployment pipeline
- [ ] **P3.12**: Add monitoring and error tracking
- [ ] **P3.13**: Performance monitoring and optimization

### Critical Path Dependencies

1. **P1.1-P1.4** → **P1.5-P1.12** (HTML Version)
2. **P1.1-P1.4** → **P1.13-P1.19** (Worker Version)  
3. **P1.5-P1.12** completed → **P2.1-P2.14**
4. **P2.1-P2.14** completed → **P3.1-P3.13**

### Estimated Timeline

| Phase | Tasks | Duration | Dependencies |
|-------|-------|----------|--------------|
| Phase 1 | P1.1-P1.19 | 2-3 hours | None |
| Phase 2 | P2.1-P2.14 | 1-2 hours | Phase 1 complete |
| Phase 3 | P3.1-P3.13 | 1-2 hours | Phase 2 complete |
| **Total** | **All Tasks** | **4-7 hours** | Sequential |

### MVP Definition (Minimum Viable Product)

**Required for MVP**:
- [ ] P1.5-P1.12 (Functional HTML version)
- [ ] P1.13-P1.19 (Deployable Worker version) 
- [ ] P2.1, P2.3, P2.5 (Basic UX polish)
- [ ] P3.6-P3.7 (Basic documentation)

**Post-MVP Enhancements**: All other tasks can be completed iteratively after MVP launch.

### Success Criteria

#### Phase 1 Success
- ✅ Both deployment options work functionally
- ✅ Can send/receive messages via AI API
- ✅ Basic error handling and loading states
- ✅ Mobile-responsive design

#### Phase 2 Success
- ✅ Professional visual appearance
- ✅ Smooth user experience
- ✅ Robust error handling
- ✅ All core features working reliably

#### Phase 3 Success
- ✅ Production-ready quality
- ✅ Comprehensive documentation
- ✅ Cross-platform compatibility
- ✅ Performance optimized

---

**Project Status**: 🟢 Specification & Todo List Complete - Ready for Implementation

**Next Steps**: Begin Phase 1 implementation starting with P1.1 (project setup)