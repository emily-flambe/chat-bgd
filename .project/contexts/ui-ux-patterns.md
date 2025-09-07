# ChatBGD UI/UX Patterns

## Design Philosophy

### Core Principles
- **Minimalism**: Clean, distraction-free interface focused on conversation
- **Accessibility**: Usable by everyone, including screen reader users
- **Performance**: Fast loading and responsive interactions
- **Mobile-First**: Optimized for mobile devices with desktop enhancements

### Visual Hierarchy
- **Primary Focus**: Message input and conversation history
- **Secondary Elements**: Status indicators, character counter
- **Minimal Chrome**: No unnecessary UI elements or decorations

## Layout Patterns

### Grid-Based Layout
```css
/* Main container using CSS Grid */
.chat-container {
  display: grid;
  grid-template-rows: 1fr auto;  /* Messages flex, input fixed */
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
}
```

### Responsive Breakpoints
- **Mobile**: 0-767px (single column, full width)
- **Tablet**: 768-1023px (constrained width, larger text)
- **Desktop**: 1024px+ (max width 800px, centered)

### Message Layout Pattern
```html
<div class="message user">
  <div class="message-content">User message text</div>
  <div class="message-timestamp">12:34 PM</div>
</div>

<div class="message assistant">
  <div class="message-content">AI response text</div>
  <div class="message-timestamp">12:34 PM</div>
</div>
```

## Interaction Patterns

### Keyboard Navigation
- **Tab Order**: Input → Send Button → Messages (if focusable)
- **Enter**: Send message (unless Shift+Enter for new line)
- **Escape**: Clear input focus
- **Focus Management**: Auto-focus input after sending message

### Touch Interactions
- **Tap Targets**: Minimum 44px touch targets for mobile
- **Scroll Behavior**: Smooth scrolling to new messages
- **Pull-to-Refresh**: Optional future enhancement
- **Gesture Support**: Standard scroll and tap only

### Form Interaction Flow
1. **User types** in textarea
2. **Character counter** updates in real-time (debounced)
3. **Submit button** enables/disables based on content
4. **Enter key** submits (Shift+Enter for line breaks)
5. **Loading state** shows during API call
6. **Auto-focus** returns to input after response

## Component Patterns

### Message Component
```javascript
class MessageComponent {
  constructor(content, type, timestamp) {
    this.content = content;
    this.type = type; // 'user' | 'assistant' | 'system'
    this.timestamp = timestamp;
  }

  render() {
    return `
      <div class="message ${this.type}" role="article" tabindex="0">
        <div class="message-content">${this.escapeHtml(this.content)}</div>
        <div class="message-timestamp">${this.formatTime(this.timestamp)}</div>
      </div>
    `;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
```

### Input Component Pattern
```javascript
class ChatInput {
  constructor(onSubmit) {
    this.textarea = document.getElementById('message-input');
    this.counter = document.getElementById('char-counter');
    this.form = document.querySelector('.chat-input-form');
    this.maxLength = 4000;
    
    this.setupEventListeners(onSubmit);
  }

  setupEventListeners(onSubmit) {
    // Character counting
    this.textarea.addEventListener('input', 
      this.debounce(() => this.updateCounter(), 100));
    
    // Submit handling
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = this.textarea.value.trim();
      if (message) {
        onSubmit(message);
        this.clear();
      }
    });

    // Keyboard shortcuts
    this.textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.form.dispatchEvent(new Event('submit'));
      }
    });
  }
}
```

## Visual Design Patterns

### Color Scheme
```css
:root {
  /* Primary colors */
  --primary-blue: #007bff;
  --primary-blue-hover: #0056b3;
  
  /* Neutral colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-muted: #999999;
  
  /* Message colors */
  --user-message-bg: #007bff;
  --user-message-text: #ffffff;
  --assistant-message-bg: #f1f3f5;
  --assistant-message-text: #333333;
  
  /* System colors */
  --error-color: #dc3545;
  --success-color: #28a745;
  --warning-color: #ffc107;
  
  /* Border colors */
  --border-light: #e9ecef;
  --border-medium: #dee2e6;
}
```

### Typography Scale
```css
:root {
  /* Font families */
  --font-primary: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  
  /* Font sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  
  /* Line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

### Spacing System
```css
:root {
  /* Spacing scale */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-12: 3rem;    /* 48px */
}
```

## Animation Patterns

### Message Animations
```css
/* New message slide-in */
@keyframes slideInMessage {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message {
  animation: slideInMessage 0.3s ease-out;
}

/* Loading dots animation */
@keyframes loadingDots {
  0%, 20% { opacity: 0; }
  40% { opacity: 1; }
  100% { opacity: 0; }
}

.loading-dots span {
  animation: loadingDots 1.4s infinite;
}

.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
```

### Interaction Feedback
```css
/* Button press feedback */
button {
  transition: all 0.15s ease;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
}

button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
}

/* Input focus animation */
textarea:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
```

## Accessibility Patterns

### ARIA Labels and Roles
```html
<!-- Chat container -->
<main class="chat-container" role="main">
  <!-- Message area -->
  <section 
    class="chat-messages" 
    role="log" 
    aria-live="polite" 
    aria-label="Chat conversation">
  </section>
  
  <!-- Input form -->
  <form class="chat-input-form" aria-label="Send message">
    <label for="message-input" class="sr-only">Type your message</label>
    <textarea 
      id="message-input"
      aria-describedby="char-counter help-text"
      placeholder="Type your message..."
      required>
    </textarea>
    <div id="char-counter" aria-live="polite">0/4000</div>
    <div id="help-text" class="sr-only">
      Press Enter to send, Shift+Enter for new line
    </div>
    <button type="submit" aria-label="Send message">Send</button>
  </form>
</main>
```

### Screen Reader Support
```css
/* Screen reader only text */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus indicators */
*:focus {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
}

/* High contrast support */
@media (prefers-contrast: high) {
  :root {
    --border-light: #000000;
    --text-secondary: #000000;
  }
}
```

### Keyboard Navigation
```javascript
// Focus management for accessibility
class AccessibilityManager {
  static focusInput() {
    const input = document.getElementById('message-input');
    input?.focus();
  }

  static announceMessage(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `New message: ${message}`;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }

  static handleKeyboardNavigation(event) {
    // Escape key clears focus
    if (event.key === 'Escape') {
      document.activeElement?.blur();
    }
    
    // Focus management for message navigation
    if (event.key === 'ArrowUp' && event.ctrlKey) {
      // Navigate to previous message
      this.focusPreviousMessage();
    }
  }
}
```

## Error State Patterns

### Error Message Display
```javascript
class ErrorHandler {
  static displayError(message, type = 'error') {
    const errorContainer = document.createElement('div');
    errorContainer.className = `message system ${type}`;
    errorContainer.setAttribute('role', 'alert');
    errorContainer.innerHTML = `
      <div class="message-content">
        <span class="error-icon" aria-hidden="true">⚠️</span>
        ${this.escapeHtml(message)}
      </div>
    `;
    
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.appendChild(errorContainer);
    
    // Auto-remove after delay
    setTimeout(() => {
      errorContainer.remove();
    }, 5000);
  }

  static handleNetworkError() {
    this.displayError(
      'Connection lost. Please check your internet connection and try again.',
      'warning'
    );
  }

  static handleServerError(status) {
    const message = status === 503 
      ? 'Service temporarily unavailable. Please try again in a moment.'
      : 'Something went wrong. Please try again.';
    
    this.displayError(message, 'error');
  }
}
```

## Loading State Patterns

### Loading Indicators
```html
<!-- Typing indicator -->
<div class="message assistant loading" role="status" aria-label="AI is typing">
  <div class="message-content">
    <span class="loading-dots">
      <span>●</span>
      <span>●</span>
      <span>●</span>
    </span>
  </div>
</div>

<!-- Button loading state -->
<button type="submit" class="loading" disabled aria-label="Sending message">
  <span class="spinner" aria-hidden="true"></span>
  Sending...
</button>
```

### Progressive Enhancement
```javascript
// Graceful degradation for JavaScript disabled
class ProgressiveEnhancement {
  static init() {
    // Remove no-js class
    document.documentElement.classList.remove('no-js');
    document.documentElement.classList.add('js');
    
    // Enable enhanced features
    this.enableKeyboardShortcuts();
    this.enableRealTimeUpdates();
  }

  static enableKeyboardShortcuts() {
    // Only enable if JavaScript is available
    const form = document.querySelector('.chat-input-form');
    form.setAttribute('data-enhanced', 'true');
  }
}
```

---

*UI/UX patterns documentation for ChatBGD - Last updated: 2025-08-13*