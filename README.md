# ChatBGD - AI Chat Interface

A minimal, production-ready web interface for AI chat interactions, deployed as a Cloudflare Worker to `chat.emilycogsdill.com`.

## Quick Start

### Local Development
```bash
# Install dependencies (first time only)
npm install

# Start development server  
npm run dev
```
Then visit the local URL shown in terminal (usually `http://localhost:8787`)

### Production Deployment
```bash
# Deploy to chat.emilycogsdill.com
npm run deploy
```

## Usage

1. **Start chatting** immediately - no API key required!
2. **Keyboard shortcuts**: Enter to send, Shift+Enter for new line
3. **Character limit**: 4000 characters per message

## Features

- ✅ Clean, responsive chat interface
- ✅ **No API key required** - server-side authentication
- ✅ Real-time status indicator
- ✅ Auto-expanding message input with character counter
- ✅ Keyboard shortcuts and mobile-friendly design
- ✅ Loading states and comprehensive error handling
- ✅ Cloudflare Workers deployment with global CDN
- ✅ Secure API proxying with CORS support

## Architecture

### Cloudflare Worker Deployment
- **Worker Name**: `chat-bgd`
- **Production URL**: `https://chat.emilycogsdill.com`
- **Static assets**: Embedded into worker for optimal performance
- **CORS**: Proper handling for external API calls

### API Integration
- **Frontend**: Calls worker's `/api/chat` endpoint
- **Worker**: Proxies to `https://ai.emilycogsdill.com/api/v1/chat` 
- **Authentication**: Server-side using `CLOUDFLARE_AI_WORKER_API_TOKEN` secret
- **Request**: `{message: string, systemPrompt?: string}`
- **Response**: `{response: string, error?: string}`

## Project Structure

```
chat-bgd/
├── .specs/
│   └── chat-bgd-web-app.md     # Comprehensive specification
├── src/
│   ├── index.ts                # Cloudflare Worker entry point
│   ├── static/                 # Static assets (HTML, CSS, JS)
│   │   ├── index.html          # Main chat interface
│   │   ├── styles.css          # UI styling
│   │   └── script.js           # Chat functionality
│   └── lib/
│       └── static.ts           # Generated embedded assets
├── build-static.js             # Asset embedding build script
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── wrangler.toml              # Cloudflare Worker configuration
└── README.md                   # This file
```

## Development Workflow

1. **Edit static files** in `src/static/`
2. **Run build** to embed assets: `npm run build`
3. **Test locally** with: `npm run dev`
4. **Deploy** when ready: `npm run deploy`

## Authentication Setup

The worker uses server-side authentication with the `CLOUDFLARE_AI_WORKER_API_TOKEN` secret:

```bash
# Add the token as a Wrangler secret (one-time setup)
wrangler secret put CLOUDFLARE_AI_WORKER_API_TOKEN
```

For local development, add to `.dev.vars`:
```bash
# Create .dev.vars file with your token
echo "CLOUDFLARE_AI_WORKER_API_TOKEN=your_token_here" > .dev.vars
```

## Browser Support

Modern browsers with ES6+ support:
- Chrome/Chromium ✅
- Safari ✅  
- Firefox ✅
- Mobile browsers ✅

## Security

- **Server-side authentication** - no client-side API keys
- **Secure token storage** - API token stored as Wrangler secret
- **HTTPS-only API calls** with proper CORS headers
- **Input validation** - message length and content sanitization
- **No sensitive data logging** in client or worker

---

**Status**: ✅ Production Ready - Cloudflare Workers deployment

**Live URL**: https://chat.emilycogsdill.com (after deployment)