# Context Memory Implementation Checklist

## Implementation Steps (1 hour)

### Step 1: Update Frontend (20 mins)
- [ ] Add conversationHistory array to ChatBGD constructor
- [ ] Add maxChars = 400000 constant
- [ ] Store user messages when sent
- [ ] Store AI responses when received
- [ ] Add conversationHistory to API request body

### Step 2: Update Backend (20 mins)
- [ ] Accept conversationHistory in request body (index.ts)
- [ ] Forward conversationHistory to AI worker if present
- [ ] Test API still works with/without history

### Step 3: Add UI Elements (20 mins)
- [ ] Add usage-info div to index.html
- [ ] Add character count span element
- [ ] Add new conversation button (hidden by default)
- [ ] Style elements to match existing UI
- [ ] Add updateUsage() method to update display
- [ ] Call updateUsage() after each message
- [ ] Show warning at 90% (360k chars)
- [ ] Disable input at 100% (400k chars)
- [ ] Show new conversation button when needed
- [ ] Implement reset functionality

## Testing
- [ ] Verify conversation history builds up
- [ ] Confirm AI references previous messages
- [ ] Check character count updates correctly
- [ ] Test warning appears at 90%
- [ ] Test input disables at 100%
- [ ] Test new conversation button works

## Build & Deploy
- [ ] Run npm run build
- [ ] Test with npm run dev
- [ ] Deploy with npm run deploy
- [ ] Test on production

Done. Ship it.