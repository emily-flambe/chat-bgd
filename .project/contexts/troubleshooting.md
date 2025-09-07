# ChatBGD Troubleshooting Guide

## Common Development Issues

### Build and Compilation Problems

#### Static Assets Not Updating
**Symptoms:**
- Changes to HTML, CSS, or JS files not reflected in browser
- Old content still showing after modifications

**Root Cause:** 
- Static assets are embedded into the worker at build time
- Changes require rebuilding the embedded assets

**Solution:**
```bash
# Always rebuild after changing static files
npm run build

# Then restart dev server
npm run dev

# Or use the combined command
npm run dev  # (automatically runs build first)
```

**Prevention:**
- Always run `npm run build` after editing files in `src/static/`
- Use `wrangler dev` with file watching for automatic rebuilds

#### TypeScript Compilation Errors
**Symptoms:**
- Build fails with TypeScript errors
- `wrangler deploy` fails with compilation issues

**Common Causes:**
```typescript
// ❌ Missing types for environment
const token = env.SOME_TOKEN;  // Property 'SOME_TOKEN' does not exist

// ✅ Proper interface definition
interface Env {
  CLOUDFLARE_AI_WORKER_API_TOKEN: string;
  AI_WORKER: Fetcher;
}
```

**Solution:**
1. Check `Env` interface includes all used environment variables
2. Verify TypeScript version compatibility: `npx tsc --version`
3. Clean and reinstall: `rm -rf node_modules && npm install`

#### Build Script Failures
**Symptoms:**
- `npm run build` fails with file system errors
- "Cannot read file" or "Permission denied" errors

**Debugging Steps:**
```bash
# Check file permissions
ls -la src/static/

# Verify files exist
find src/static/ -type f

# Run build script directly for better error messages
node build-static.js
```

### Local Development Problems

#### Development Server Won't Start
**Symptoms:**
- `npm run dev` fails or hangs
- Port already in use errors

**Solutions:**
```bash
# Check what's using port 8787
lsof -i :8787

# Kill existing wrangler processes
pkill -f "wrangler"

# Start with different port
wrangler dev --port 8788

# Clear wrangler cache
rm -rf ~/.config/wrangler
```

#### Environment Variables Not Loading
**Symptoms:**
- API calls fail with authentication errors
- `env.CLOUDFLARE_AI_WORKER_API_TOKEN` is undefined

**Solution:**
```bash
# Create .dev.vars file in project root
echo "CLOUDFLARE_AI_WORKER_API_TOKEN=your_token_here" > .dev.vars

# Verify file exists and has correct format
cat .dev.vars

# Restart wrangler dev server
pkill -f "wrangler" && npm run dev
```

#### Service Binding Failures
**Symptoms:**
- API calls to `/api/chat` fail with 500 errors
- "Service binding 'AI_WORKER' not found" errors

**Debugging:**
```bash
# Check service binding configuration
cat wrangler.toml | grep -A 3 "services"

# Verify ai-worker service exists
wrangler services list

# Test with dry run
wrangler deploy --dry-run
```

**Fix Service Binding:**
```toml
# In wrangler.toml
[[services]]
binding = "AI_WORKER"
service = "ai-worker"  # Must match actual service name
```

### API Integration Issues

#### 503 Service Unavailable Errors
**Symptoms:**
- Chat requests fail with "Service temporarily unavailable"
- Health check endpoint shows service errors

**Investigation Steps:**
```bash
# Check worker logs
wrangler tail

# Test health check endpoint
curl https://chat.emilycogsdill.com/healthcheck

# Test local health check
curl http://localhost:8787/healthcheck
```

**Common Causes:**
1. **Backend service down**: ai-worker not deployed or not responding
2. **Authentication failure**: Invalid or missing API token
3. **Service binding misconfiguration**: Wrong service name in wrangler.toml

#### CORS Errors in Browser
**Symptoms:**
- Browser console shows CORS policy errors
- API calls fail from different origins

**Solution:**
```typescript
// Ensure all responses include CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// Handle preflight requests
if (request.method === 'OPTIONS') {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}
```

#### Timeout Errors
**Symptoms:**
- Long delays before API responses
- Requests timing out in browser

**Investigation:**
```typescript
// Add timing logs to identify bottlenecks
console.time('api-request');
const response = await env.AI_WORKER.fetch(request);
console.timeEnd('api-request');

// Check backend response time
console.log('Backend response time:', response.headers.get('x-response-time'));
```

### Frontend JavaScript Issues

#### Event Listeners Not Working
**Symptoms:**
- Form submission doesn't work
- Keyboard shortcuts not responding
- Character counter not updating

**Debugging:**
```javascript
// Check if DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing app...');
  
  // Verify elements exist
  const form = document.querySelector('.chat-input-form');
  const input = document.getElementById('message-input');
  
  if (!form) console.error('Form not found!');
  if (!input) console.error('Input not found!');
  
  // Initialize app
  new ChatApp();
});

// Debug event listener attachment
form.addEventListener('submit', (e) => {
  console.log('Form submitted:', e);
  // ... rest of handler
});
```

#### Character Counter Issues
**Symptoms:**
- Counter shows wrong numbers
- Counter doesn't update on input

**Common Fixes:**
```javascript
// Ensure proper debouncing
updateCharCounter() {
  const length = this.messageInput.value.length;
  const maxLength = 4000;
  
  // Update counter display
  this.charCounter.textContent = `${length}/${maxLength}`;
  
  // Update ARIA live region for screen readers
  this.charCounter.setAttribute('aria-live', 'polite');
  
  // Disable submit if over limit
  const submitBtn = document.querySelector('button[type="submit"]');
  submitBtn.disabled = length === 0 || length > maxLength;
}

// Debounce function to prevent excessive updates
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
```

### Deployment Issues

#### Deployment Fails
**Symptoms:**
- `wrangler deploy` fails with authentication errors
- Deployment succeeds but site doesn't work

**Authentication Fix:**
```bash
# Re-authenticate with Cloudflare
wrangler logout
wrangler login

# Verify account access
wrangler whoami

# Check zone permissions
wrangler zones list
```

#### Custom Domain Not Working
**Symptoms:**
- Worker deploys but custom domain shows errors
- DNS resolution issues

**Investigation:**
```bash
# Check DNS configuration
dig chat.emilycogsdill.com

# Verify route configuration in wrangler.toml
cat wrangler.toml | grep -A 2 "routes"

# Test worker on workers.dev subdomain first
curl https://chat-bgd.your-subdomain.workers.dev
```

#### Production Environment Differences
**Symptoms:**
- Works locally but fails in production
- Different behavior between dev and prod

**Debugging:**
```typescript
// Add environment detection
const isDev = typeof Request !== 'undefined' && 
              new URL(request.url).hostname.includes('localhost');

console.log('Environment:', isDev ? 'development' : 'production');

// Log environment variables (safely)
console.log('Environment keys:', Object.keys(env));
// Never log actual secret values!
```

### Performance Issues

#### Slow Cold Starts
**Symptoms:**
- First request takes long time to respond
- Intermittent delays in API responses

**Optimization:**
```typescript
// Minimize imports and initialization
// ❌ Avoid heavy imports at module level
import heavyLibrary from 'heavy-library';

// ✅ Lazy load only when needed
async function processRequest() {
  if (needsHeavyProcessing) {
    const { heavyFunction } = await import('heavy-library');
    return heavyFunction();
  }
}

// Keep worker code minimal
export default {
  async fetch(request, env) {
    // Quick routing without heavy processing
    const url = new URL(request.url);
    
    if (url.pathname === '/api/chat') {
      return handleChat(request, env);
    }
    
    return serveStatic(url.pathname);
  }
};
```

#### Large Bundle Size
**Symptoms:**
- Slow deployment times
- Worker size warnings

**Bundle Optimization:**
```bash
# Check worker size
wrangler deploy --dry-run

# Optimize static assets
# Minify CSS and JavaScript manually
# Compress images before embedding
# Remove unused code from static files
```

### Monitoring and Logging

#### Missing Logs
**Symptoms:**
- No logs appear in `wrangler tail`
- Debug information not showing

**Enable Logging:**
```toml
# In wrangler.toml
[observability.logs]
enabled = true
```

```typescript
// Use structured logging
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  level: 'info',
  message: 'API request received',
  path: url.pathname,
  method: request.method
}));
```

#### Error Tracking
```typescript
// Implement error tracking
class ErrorTracker {
  static logError(error, context = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
      userAgent: context.request?.headers?.get('user-agent'),
      url: context.request?.url
    };
    
    console.error('Application Error:', JSON.stringify(errorInfo));
    
    // In production, consider sending to external service
    // await this.sendToLoggingService(errorInfo);
  }
}

// Use in error handlers
try {
  // ... code that might fail
} catch (error) {
  ErrorTracker.logError(error, { request, operation: 'chat-api' });
  return errorResponse('Service temporarily unavailable');
}
```

## Emergency Procedures

### Service Outage Response
1. **Check service status**: `wrangler services list`
2. **Review recent deployments**: `wrangler deployments list`
3. **Check error logs**: `wrangler tail --format json`
4. **Rollback if needed**: Deploy previous working version
5. **Monitor recovery**: Verify health check endpoints

### Data Loss Prevention
- **No persistent data**: ChatBGD is stateless
- **Configuration backup**: Keep wrangler.toml in version control
- **Secret rotation**: Regularly rotate API tokens
- **Deployment validation**: Always test in development first

---

*Troubleshooting guide for ChatBGD - Last updated: 2025-08-13*