# Technical Planning: Chat Context Memory

## Purpose
Add conversation history to ChatBGD so the AI remembers previous messages.

## Implementation (1 hour total)

### Step 1: Store Conversation History (20 mins)
Update existing `script.js`:
```javascript
// Add to ChatBGD constructor
this.conversationHistory = [];
this.maxChars = 400000;

// Store messages when sent/received
this.conversationHistory.push({role: 'user', content: message});
this.conversationHistory.push({role: 'assistant', content: response});
```

### Step 2: Send History with API Calls (20 mins)
```javascript
// Add to API request body
const requestBody = {
  message: userMessage,
  instructions: this.instructions,
  reasoningLevel: this.reasoningLevel,
  conversationHistory: this.conversationHistory // NEW
};
```

Update `index.ts` to accept and forward history:
```typescript
const { message, instructions, reasoningLevel, conversationHistory } = body;
if (conversationHistory) {
  aiRequestBody.conversationHistory = conversationHistory;
}
```

### Step 3: Add Usage Indicator (20 mins)
Add to `index.html`:
```html
<div class="usage-info">
  <span id="char-count">0 / 400k characters</span>
  <button id="new-conversation" style="display:none;">New Conversation</button>
</div>
```

Update character count after each message:
```javascript
updateUsage() {
  const chars = this.conversationHistory.map(m => m.content).join('').length;
  document.getElementById('char-count').textContent = `${Math.round(chars/1000)}k / 400k characters`;
  
  if (chars > 360000) { // 90%
    this.showWarning();
  }
  if (chars >= 400000) {
    this.disableInput();
  }
}
```

## Testing
1. Send a few messages and verify history builds up
2. Check that AI responses reference earlier messages
3. Verify warning appears at 90% capacity
4. Confirm input disables at 100%
5. Test reset button functionality

## What We're NOT Building
- Complex token counting algorithms
- Separate state management modules
- Multi-tier warning systems
- Extensive UI components

## Success = Working Context Memory
That's it. Simple and functional.