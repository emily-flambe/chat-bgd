# Project: ChatBGD

## Overview
A minimal, production-ready AI chat interface deployed as a Cloudflare Worker to `chat.emilycogsdill.com`. Features server-side authentication, embedded static assets, and proxied API calls to the AI backend service.

## Architecture
<!-- See detailed architecture documentation -->
See: .project/contexts/architecture.md

## Coding Standards
<!-- Language-specific guidelines and conventions -->
See: .project/contexts/coding-standards.md

## Dependencies & Versions
<!-- Framework versions and package requirements -->
See: .project/contexts/dependencies.md

## UI/UX Patterns
<!-- User interface patterns and design decisions -->
See: .project/contexts/ui-ux-patterns.md

## Debugging & Troubleshooting
<!-- Common issues and debugging procedures -->
See: .project/contexts/troubleshooting.md

## Quick Start Commands

### Development
```bash
# Install dependencies (first time)
npm install

# Start development server
npm run dev

# Build static assets
npm run build
```

### Deployment
```bash
# Deploy to production (chat.emilycogsdill.com)
npm run deploy
```

### Environment Setup
```bash
# Add API token for local development
echo "CLOUDFLARE_AI_WORKER_API_TOKEN=your_token_here" > .dev.vars

# Add token as production secret (one-time)
wrangler secret put CLOUDFLARE_AI_WORKER_API_TOKEN
```

## AI Assistant Guidelines

### For All Assistants
- Follow TypeScript strict mode and type safety
- Prioritize build success and minimal complexity
- Use simple, maintainable patterns
- Prefer editing existing files over creating new ones
- Include comprehensive error handling
- Test both local dev and production deployment

### Critical Requirements
- **Wrangler v4.0.0+** required for all operations
- `.dev.vars` must exist with `CLOUDFLARE_AI_WORKER_API_TOKEN`
- Static assets must be embedded via `npm run build`
- Service binding to `ai-worker` for backend communication

### 🚨 DEPLOYMENT CONFIGURATION - CRITICAL 🚨
- **Worker Name**: `chat-bgd` (EXACT NAME - NO VARIATIONS)
- **Production Domain**: `chat.emilycogsdill.com`
- **Backend Service**: Uses service binding to `ai-worker`
- **Authentication**: Server-side via `CLOUDFLARE_AI_WORKER_API_TOKEN`
- **Static Assets**: Embedded into worker for optimal performance

### Development Workflow
1. **Edit static files** in `src/static/` (HTML, CSS, JS)
2. **Run build** to embed assets: `npm run build`
3. **Test locally** with: `npm run dev`
4. **Deploy** when ready: `npm run deploy`

### Tool-Specific Instructions

#### Claude Code
- Use artifacts for substantial static asset generation
- Follow minimal UI patterns with focus on accessibility
- Test API integration thoroughly in development

#### Other AI Assistants
- Follow the unified configuration in `.project/`
- Respect project-specific conventions
- Use modular context files for detailed information

## Security & Performance
- Server-side authentication (no client-side API keys)
- HTTPS-only API calls with proper CORS
- Embedded static assets for optimal CDN performance
- Input validation and sanitization
- Rate limiting via Cloudflare Workers

## Common Troubleshooting

### Development Issues
```bash
# Clean install and rebuild
rm -rf node_modules package-lock.json && npm install
npm run build && npm run dev
```

### Static Assets Not Updating
- Always run `npm run build` after modifying `src/static/` files
- Build script embeds assets into `src/lib/static.ts`
- Worker serves embedded assets, not files directly

### API Authentication Problems
- Verify `CLOUDFLARE_AI_WORKER_API_TOKEN` is set in `.dev.vars`
- Check service binding to `ai-worker` in `wrangler.toml`
- Test `/healthcheck` endpoint for backend connectivity

### Deployment Issues
```bash
# Verify configuration
wrangler deploy --dry-run

# Check worker logs
wrangler tail
```

## Project Philosophy
1. **Minimalism**: Keep interface clean and focused
2. **Performance**: Edge-first architecture with embedded assets
3. **Security**: Server-side authentication and validation
4. **Reliability**: Comprehensive error handling and status indicators
5. **Accessibility**: Keyboard shortcuts and mobile-friendly design

---
*Unified AI configuration for ChatBGD project - Version 1.0.0*