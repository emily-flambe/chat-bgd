# ChatBGD Dependencies

## Runtime Dependencies

### Production Dependencies
**None** - The project uses only browser and Cloudflare Workers built-in APIs.

### Rationale for Zero Dependencies
- **Performance**: Minimal bundle size and faster cold starts
- **Security**: Reduced attack surface with no third-party code
- **Reliability**: No external dependency updates or vulnerabilities
- **Simplicity**: Easier maintenance and debugging

## Development Dependencies

### Core Development Tools

#### @cloudflare/workers-types ^4.20241230.0
- **Purpose**: TypeScript definitions for Cloudflare Workers APIs
- **Usage**: Provides type safety for Worker runtime environment
- **Critical**: Required for proper TypeScript compilation
- **Update Policy**: Follow Cloudflare's latest stable release

#### typescript ^5.7.3
- **Purpose**: TypeScript compiler and language support
- **Usage**: Compiles TypeScript source to JavaScript
- **Configuration**: Uses strict mode with comprehensive type checking
- **Update Policy**: Stay current with stable releases

#### wrangler ^4.24.3
- **Purpose**: Cloudflare Workers CLI for development and deployment
- **Usage**: Local development server, deployment, secret management
- **Critical**: Version 4.0.0+ required for service binding support
- **Update Policy**: Keep updated for latest Cloudflare features

## Browser API Dependencies

### Frontend JavaScript APIs
The frontend uses only standard Web APIs available in modern browsers:

#### Core APIs Used
- **Fetch API**: HTTP requests to worker endpoints
- **DOM API**: Element manipulation and event handling
- **JSON**: Data serialization/deserialization
- **Event API**: User interaction handling
- **FormData**: Form submission handling

#### Browser Compatibility Requirements
```javascript
// Minimum supported browser features
const requiredFeatures = {
  'ES6 Classes': 'class ChatApp {}',
  'Arrow Functions': '() => {}',
  'Async/Await': 'async function() { await fetch() }',
  'Fetch API': 'fetch("/api/chat")',
  'Template Literals': '`Message: ${text}`',
  'const/let': 'const app = new ChatApp()',
  'CSS Grid': 'display: grid',
  'CSS Custom Properties': '--primary-color: blue'
};
```

#### Supported Browsers
- **Chrome/Chromium**: 60+ (2017+)
- **Firefox**: 55+ (2017+)
- **Safari**: 12+ (2018+)
- **Edge**: 79+ (2020+)
- **Mobile Chrome**: 60+ (2017+)
- **Mobile Safari**: 12+ (2018+)

## Worker Runtime Dependencies

### Cloudflare Workers Runtime APIs
The worker uses built-in Cloudflare Workers APIs:

#### Core Runtime APIs
- **Request/Response**: HTTP handling
- **URL**: URL parsing and manipulation
- **JSON**: Data serialization
- **Headers**: HTTP header management
- **Service Bindings**: Inter-worker communication
- **Environment Variables**: Configuration access

#### Service Dependencies
```typescript
// Required service bindings in wrangler.toml
interface Env {
  // AI backend service (required)
  AI_WORKER: Fetcher;
  
  // Optional analytics storage
  ANALYTICS?: KVNamespace;
}
```

## Build System Dependencies

### Node.js Build Tools
The build process uses minimal Node.js built-in modules:

#### Required Node.js APIs
- **fs (File System)**: Reading static assets
- **path**: File path manipulation  
- **process**: Build script control

#### Build Script Dependencies
```javascript
// Only Node.js built-ins used in build-static.js
const fs = require('fs');
const path = require('path');

// No external build dependencies required
```

## Environment Requirements

### Development Environment
```json
{
  "node": ">=18.0.0",
  "npm": ">=8.0.0",
  "wrangler": ">=4.0.0"
}
```

### Production Environment
- **Cloudflare Workers**: V8 isolate runtime
- **Service Binding**: Connection to `ai-worker`
- **Environment Variables**: `CLOUDFLARE_AI_WORKER_API_TOKEN`

## Version Management Strategy

### Dependency Update Policy
1. **Wrangler**: Update within 1 month of stable release
2. **TypeScript**: Update within 2 months of stable release  
3. **Workers Types**: Update with Wrangler updates
4. **Node.js**: LTS versions only, update annually

### Breaking Change Management
1. **Test thoroughly** in development environment
2. **Verify deployment** works with new versions
3. **Check service bindings** still function correctly
4. **Monitor error rates** after production deployment

### Security Updates
- **Immediate**: Security patches for all dependencies
- **Weekly Check**: Review GitHub security advisories
- **Automated Scanning**: Use `npm audit` in CI/CD

## Package.json Configuration

### Current Configuration
```json
{
  "name": "chat-bgd",
  "version": "1.0.0",
  "description": "Minimal AI chat interface for Cloudflare Workers",
  "scripts": {
    "dev": "npm run build && wrangler dev",
    "build": "node build-static.js",
    "deploy": "npm run build && wrangler deploy"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20241230.0",
    "typescript": "^5.7.3",
    "wrangler": "^4.24.3"
  }
}
```

### Script Explanations
- **dev**: Builds assets and starts development server
- **build**: Embeds static assets into TypeScript module
- **deploy**: Builds and deploys to production

## Wrangler Configuration

### Required wrangler.toml Settings
```toml
name = "chat-bgd"
compatibility_date = "2024-12-30"
compatibility_flags = ["nodejs_compat"]

# Service binding to AI backend (critical)
[[services]]
binding = "AI_WORKER"
service = "ai-worker"

# Build configuration
[build]
command = "npm run build"
watch_dir = ["src/static"]
```

## Future Dependency Considerations

### Potential Additions (If Needed)
- **CSS Preprocessor**: For complex styling (Sass/PostCSS)
- **Bundler**: For more complex JavaScript (esbuild/Rollup)
- **Testing Framework**: For automated testing (Vitest)
- **Linting**: For code quality (ESLint/Prettier)

### Principles for New Dependencies
1. **Justify the need**: Can the feature be built without it?
2. **Evaluate alternatives**: Choose the minimal viable option
3. **Consider maintenance**: Will this be actively maintained?
4. **Security review**: Does this increase attack surface?
5. **Performance impact**: Will this slow down cold starts?

## Troubleshooting Dependencies

### Common Issues

#### Wrangler Version Conflicts
```bash
# Check current version
wrangler --version

# Update to latest
npm install wrangler@latest

# Clear cache if needed
wrangler logout && wrangler login
```

#### TypeScript Compilation Errors
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript version
npx tsc --version
```

#### Service Binding Issues
```bash
# Verify service exists
wrangler services list

# Check binding configuration
wrangler deploy --dry-run
```

---

*Dependencies documentation for ChatBGD - Last updated: 2025-08-13*