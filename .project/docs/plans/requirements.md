# Chat Context Memory Requirements

## Overview
Enhancement to ChatBGD to implement conversation context memory, allowing the AI chatbot to maintain conversation history across messages with proper context size management.

## Core Requirements

### 1. Context Persistence
- **R1.1**: The chatbot must remember the entire conversation history within a single session
- **R1.2**: Each new message must be sent with the full conversation context
- **R1.3**: Context must include both user messages and AI responses in chronological order
- **R1.4**: System instructions (if provided) must be preserved throughout the conversation

### 2. Context Size Management
- **R2.1**: Implement real-time context size tracking
- **R2.2**: Display context usage indicator in the UI
- **R2.3**: Define context size thresholds:
  - Safe zone: 0-70% of max context
  - Warning zone: 70-90% of max context
  - Critical zone: 90-100% of max context
- **R2.4**: Max context size should be configurable (default: 100,000 tokens / ~400,000 characters)

### 3. User Warnings
- **R3.1**: Visual indicator showing current context usage (progress bar or percentage)
- **R3.2**: Warning message when entering warning zone (70% capacity)
- **R3.3**: Critical warning when approaching limit (90% capacity)
- **R3.4**: Clear messaging about remaining capacity in messages/characters

### 4. Conversation Termination
- **R4.1**: Prevent new messages when context limit is reached
- **R4.2**: Display clear end-of-conversation message
- **R4.3**: Offer option to start a new conversation
- **R4.4**: Preserve final conversation state for user reference

### 5. UI/UX Requirements
- **R5.1**: Context indicator always visible during active conversation
- **R5.2**: Smooth transitions between context states (safe → warning → critical)
- **R5.3**: Non-intrusive warnings that don't interrupt typing
- **R5.4**: Clear visual differentiation between warning states (colors, icons)

## Technical Specifications

### Model Context Information
- **GPT-OSS-120b**: 128,000 token context window
- **GPT-OSS-20b**: 128,000 token context window
- **Token Estimation**: 1 token ≈ 4 characters (English text)

### Recommended Token Limits
- **Default Conversation Limit**: 100,000 tokens (~78% of model capacity)
- **Warning Threshold**: 70,000 tokens (70% of limit)
- **Critical Threshold**: 90,000 tokens (90% of limit)
- **Character Approximation**: 400,000 characters maximum

### Context Structure
```typescript
interface ConversationContext {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
  }>;
  systemInstructions?: string;
  totalTokens: number;
  maxTokens: number;
}
```

### API Integration
- Modify `/api/chat` endpoint to accept full conversation history
- Include context size in API response
- Handle context-too-large errors gracefully

### State Management
- Maintain conversation history in frontend state
- Calculate approximate token count client-side
- Sync token count with server response for accuracy

## User Stories

### US1: Basic Conversation Flow
As a user, I want the AI to remember our previous messages so that I can have a coherent, contextual conversation.

### US2: Context Awareness
As a user, I want to see how much context capacity I'm using so that I can manage my conversation length effectively.

### US3: Warning Notifications
As a user, I want to be warned before reaching the context limit so that I can wrap up my conversation gracefully.

### US4: Conversation Completion
As a user, I want a clear indication when the conversation must end due to context limits and an easy way to start fresh.

## Implementation Phases

### Phase 1: Core Context Memory
- Implement conversation history storage
- Modify API to send/receive full context
- Basic token counting

### Phase 2: Context Visualization
- Add context usage indicator to UI
- Implement progress bar or percentage display
- Color-coded states (green/yellow/red)

### Phase 3: Warning System
- Implement threshold detection
- Add warning messages
- Prevent message sending at limit

### Phase 4: Polish & Optimization
- Refine UI/UX based on testing
- Optimize token counting accuracy
- Add conversation export/save features (optional)

## Success Metrics
- Users can maintain conversations of 300-500 messages without context loss
- 95% of users understand context warnings before hitting limit
- Smooth performance with no noticeable lag up to context limit
- Clear user feedback at all stages of context usage
- Average conversation uses <50% of available context

## Constraints
- Must work within Cloudflare Worker limitations
- Token counting must be reasonably accurate without external libraries
- UI updates must not impact typing/interaction performance
- Context storage must be memory-efficient

## Future Considerations
- Conversation summarization to extend effective context
- Multi-conversation management
- Context export/import functionality
- Server-side conversation persistence (optional)