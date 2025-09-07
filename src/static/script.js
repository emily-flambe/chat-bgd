class ChatBGD {
    constructor() {
        this.apiEndpoint = '/api/chat';
        this.messages = [];
        this.conversationHistory = [];
        this.maxChars = 400000;
        
        this.initializeElements();
        this.bindEvents();
        this.autoResizeTextarea();
        this.updateUsage();
    }

    initializeElements() {
        this.statusIndicator = document.getElementById('statusIndicator');
        this.messagesContainer = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.charCount = document.getElementById('charCount');
        this.loading = document.getElementById('loading');
        this.reasoningModal = document.getElementById('reasoningModal');
        this.reasoningModalClose = document.getElementById('reasoningModalClose');
        this.reasoningModalBody = document.getElementById('reasoningModalBody');
        
        // New elements
        this.instructionsToggle = document.getElementById('instructionsToggle');
        this.instructionsContent = document.getElementById('instructionsContent');
        this.instructionsInput = document.getElementById('instructionsInput');
        this.instructionsCharCount = document.getElementById('instructionsCharCount');
        this.reasoningEnabled = document.getElementById('reasoningEnabled');
        this.reasoningOptions = document.getElementById('reasoningOptions');
        
        // Context elements
        this.newConversationBtn = document.getElementById('new-conversation');
    }

    bindEvents() {
        this.messageInput.addEventListener('input', () => this.handleMessageInput());
        this.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Instructions events
        this.instructionsToggle.addEventListener('click', () => this.toggleInstructions());
        this.instructionsInput.addEventListener('input', () => this.handleInstructionsInput());
        
        // Reasoning events
        this.reasoningEnabled.addEventListener('change', () => this.toggleReasoningOptions());
        
        // New conversation button
        if (this.newConversationBtn) {
            this.newConversationBtn.addEventListener('click', () => this.startNewConversation());
        }
        
        // Modal events
        this.reasoningModalClose.addEventListener('click', () => this.closeReasoningModal());
        this.reasoningModal.addEventListener('click', (e) => {
            if (e.target === this.reasoningModal) {
                this.closeReasoningModal();
            }
        });
        
        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.reasoningModal.classList.contains('show')) {
                this.closeReasoningModal();
            }
        });
    }

    handleMessageInput() {
        const message = this.messageInput.value;
        const charCount = message.length;
        
        this.charCount.textContent = `${charCount} / 4000`;
        this.charCount.style.color = charCount > 4000 ? '#dc2626' : '#6b7280';
        
        this.autoResizeTextarea();
    }

    autoResizeTextarea() {
        const textarea = this.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    toggleInstructions() {
        const isExpanded = this.instructionsContent.classList.contains('expanded');
        
        if (isExpanded) {
            this.instructionsContent.classList.remove('expanded');
            this.instructionsToggle.classList.remove('expanded');
        } else {
            this.instructionsContent.classList.add('expanded');
            this.instructionsToggle.classList.add('expanded');
            // Focus the instructions input when expanded
            setTimeout(() => this.instructionsInput.focus(), 100);
        }
    }

    handleInstructionsInput() {
        const instructions = this.instructionsInput.value;
        const charCount = instructions.length;
        
        this.instructionsCharCount.textContent = `${charCount} / 1000`;
        this.instructionsCharCount.style.color = charCount > 1000 ? '#dc2626' : '#6b7280';
        
        // Auto-resize instructions textarea
        const textarea = this.instructionsInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px';
    }

    toggleReasoningOptions() {
        const isEnabled = this.reasoningEnabled.checked;
        
        if (isEnabled) {
            this.reasoningOptions.classList.add('show');
        } else {
            this.reasoningOptions.classList.remove('show');
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        const instructions = this.instructionsInput.value.trim();
        
        if (!message) return;
        if (message.length > 4000) {
            this.showError('Message too long. Maximum 4000 characters.');
            return;
        }
        if (instructions.length > 1000) {
            this.showError('Instructions too long. Maximum 1000 characters.');
            return;
        }

        // Get reasoning settings
        const reasoningEnabled = this.reasoningEnabled.checked;
        const reasoningLevel = reasoningEnabled ? 
            document.querySelector('input[name="reasoningLevel"]:checked')?.value || 'medium' : 
            null;

        // Clear input and show user message
        this.messageInput.value = '';
        this.handleMessageInput();
        
        // Add to conversation history
        this.conversationHistory.push({role: 'user', content: message});
        
        this.addMessage('user', message);
        this.updateUsage();
        this.setLoading(true);

        try {
            const requestData = { 
                message,
                instructions: instructions || undefined,
                reasoningLevel: reasoningLevel || undefined,
                conversationHistory: this.conversationHistory.length > 0 ? this.conversationHistory : undefined
            };
            
            const response = await this.callAPI(message, instructions, reasoningLevel);
            if (response.error) {
                this.showError(response.error);
            } else {
                // Add assistant response to conversation history
                this.conversationHistory.push({role: 'assistant', content: response.response});
                this.addMessage('assistant', response.response, response.reasoning, requestData);
                this.updateUsage();
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.showError(this.getErrorMessage(error));
        } finally {
            this.setLoading(false);
        }
    }

    async callAPI(message, instructions = '', reasoningLevel = null) {
        console.log('🔍 Frontend: Starting API call');
        console.log('🔍 Frontend: API Endpoint:', this.apiEndpoint);
        console.log('🔍 Frontend: Message:', message);
        console.log('🔍 Frontend: Instructions:', instructions);
        console.log('🔍 Frontend: Reasoning Level:', reasoningLevel);
        console.log('🔍 Frontend: Current URL:', window.location.href);
        
        const requestBody = { 
            message,
            instructions: instructions || undefined,
            reasoningLevel: reasoningLevel || undefined,
            conversationHistory: this.conversationHistory.length > 0 ? this.conversationHistory : undefined
        };
        console.log('🔍 Frontend: Request body:', JSON.stringify(requestBody));
        
        try {
            console.log('🔍 Frontend: Making fetch request...');
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('🔍 Frontend: Fetch response received');
            console.log('🔍 Frontend: Response status:', response.status);
            console.log('🔍 Frontend: Response ok:', response.ok);
            console.log('🔍 Frontend: Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                console.log('🚨 Frontend: Response not OK');
                const responseText = await response.text();
                console.log('🚨 Frontend: Error response body:', responseText);
                
                if (response.status === 429) {
                    throw new Error('Rate limit exceeded');
                } else if (response.status >= 500) {
                    throw new Error('Service temporarily unavailable');
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            }

            console.log('🔍 Frontend: Parsing JSON response...');
            const jsonResponse = await response.json();
            console.log('🔍 Frontend: Parsed response:', jsonResponse);
            
            return jsonResponse;
            
        } catch (fetchError) {
            console.error('🚨 Frontend: Fetch error caught:', fetchError);
            console.error('🚨 Frontend: Error type:', typeof fetchError);
            console.error('🚨 Frontend: Error message:', fetchError.message);
            console.error('🚨 Frontend: Error stack:', fetchError.stack);
            throw fetchError;
        }
    }

    addMessage(type, content, reasoning = null, requestData = null) {
        // Remove empty state if it exists
        const emptyState = this.messagesContainer.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        if (type === 'assistant') {
            // Create message container with optional reasoning button
            const containerDiv = document.createElement('div');
            containerDiv.className = `message-container ${type}`;
            
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`;
            messageDiv.innerHTML = this.renderMarkdown(content); // Use innerHTML for markdown
            
            containerDiv.appendChild(messageDiv);
            
            if (reasoning) {
                const reasoningButton = document.createElement('button');
                reasoningButton.className = 'reasoning-button';
                reasoningButton.textContent = '?';
                reasoningButton.title = 'Show AI reasoning';
                reasoningButton.addEventListener('click', () => {
                    this.showReasoningModal(reasoning, requestData);
                });
                containerDiv.appendChild(reasoningButton);
            }
            
            
            this.messagesContainer.appendChild(containerDiv);
        } else {
            // User messages and errors - use regular message div with proper alignment
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`;
            messageDiv.textContent = content;
            this.messagesContainer.appendChild(messageDiv);
        }
        
        this.scrollToBottom();
    }

    showError(message) {
        this.addMessage('error', message);
    }

    setLoading(loading) {
        this.loading.classList.toggle('show', loading);
        this.sendButton.disabled = loading;
        this.sendButton.textContent = loading ? '...' : 'Send';
        
        if (loading) {
            this.scrollToBottom();
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 10);
    }

    getErrorMessage(error) {
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
            return 'Connection failed. Check your internet connection.';
        } else if (error.message.includes('Rate limit')) {
            return 'Too many requests. Please wait a moment.';
        } else if (error.message.includes('Service temporarily unavailable')) {
            return 'AI service temporarily unavailable. Please try again later.';
        } else {
            return error.message || 'An unexpected error occurred.';
        }
    }

    showReasoningModal(reasoning, requestData) {
        // Create the modal content with reasoning and expandable curl
        let modalContent = `<div class="reasoning-content">${reasoning || 'No reasoning available'}</div>`;
        
        if (requestData) {
            const curlCommand = `curl -X POST ${window.location.origin}/api/chat \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(requestData, null, 2)}'`;
            
            modalContent += `
                <div class="curl-section">
                    <button class="curl-toggle" onclick="this.parentElement.classList.toggle('expanded')">
                        <span class="toggle-arrow">▶</span> Show API Request
                    </button>
                    <div class="curl-content">
                        <pre>${this.escapeHtml(curlCommand)}</pre>
                    </div>
                </div>`;
        }
        
        this.reasoningModalBody.innerHTML = modalContent;
        const modalHeader = this.reasoningModal.querySelector('.reasoning-modal-header h3');
        modalHeader.textContent = 'AI Reasoning';
        
        this.reasoningModal.classList.add('show');
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    closeReasoningModal() {
        this.reasoningModal.classList.remove('show');
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    showRequestModal(requestData) {
        // Create curl command representation
        const curlCommand = `curl -X POST ${window.location.origin}/api/chat \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(requestData, null, 2)}'`;
        
        // Show the request data in a modal (reuse reasoning modal structure)
        const modalBody = document.getElementById('reasoningModalBody');
        const modalHeader = this.reasoningModal.querySelector('.reasoning-modal-header h3');
        
        modalHeader.textContent = 'Full API Request';
        modalBody.innerHTML = `<pre style="white-space: pre-wrap; word-wrap: break-word;">${curlCommand}</pre>`;
        
        this.reasoningModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    updateUsage() {
        // More accurate calculation: include full JSON structure
        const chars = this.conversationHistory.length > 0 ? JSON.stringify(this.conversationHistory).length : 0;
        const charCountElement = document.getElementById('context-char-count');
        const newConversationBtn = document.getElementById('new-conversation');
        
        if (charCountElement) {
            charCountElement.textContent = `${Math.round(chars/1000)}k / 400k characters`;
            
            // Update color based on usage level
            const percentage = (chars / this.maxChars) * 100;
            if (percentage >= 90) {
                charCountElement.style.color = '#dc2626'; // red
                const remaining = Math.round(100 - percentage);
                this.showWarning(`Context limit approaching! You have ${remaining}% capacity remaining.`);
                newConversationBtn.style.display = 'inline-block';
            } else if (percentage >= 70) {
                charCountElement.style.color = '#f59e0b'; // orange
            } else {
                charCountElement.style.color = '#10b981'; // green
            }
            
            // Disable input if at limit
            if (chars >= this.maxChars) {
                this.disableInput();
            }
        }
    }
    
    showWarning(message) {
        // Show a warning message at the top of the chat
        const existingWarning = document.querySelector('.context-warning');
        if (!existingWarning) {
            const warning = document.createElement('div');
            warning.className = 'context-warning';
            warning.textContent = message;
            this.messagesContainer.appendChild(warning);
            this.scrollToBottom();
        }
    }
    
    disableInput() {
        this.messageInput.disabled = true;
        this.messageInput.placeholder = 'Context limit reached. Please start a new conversation.';
        this.sendButton.disabled = true;
        this.showError('Context limit reached. Please start a new conversation to continue.');
    }
    
    startNewConversation() {
        this.conversationHistory = [];
        this.messages = [];
        this.messagesContainer.innerHTML = '<div class="empty-state">No messages yet. Start a conversation!</div>';
        this.messageInput.disabled = false;
        this.messageInput.placeholder = 'Type your message... (Enter to send, Shift+Enter for new line)';
        this.sendButton.disabled = false;
        document.getElementById('new-conversation').style.display = 'none';
        
        // Clear any existing warnings
        const existingWarning = document.querySelector('.context-warning');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        this.updateUsage();
    }

    renderMarkdown(text) {
        // Basic markdown renderer - handles common elements
        let html = text;
        
        // Escape HTML first, but preserve line breaks
        html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Bold **text** and __text__
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
        
        // Italic *text* and _text_
        html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');
        html = html.replace(/(?<!_)_([^_\n]+?)_(?!_)/g, '<em>$1</em>');
        
        // Code `text`
        html = html.replace(/`([^`]+?)`/g, '<code>$1</code>');
        
        // Headers (# ## ###)
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Links [text](url)
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Line breaks (double newlines become paragraphs)
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        
        // Single line breaks
        html = html.replace(/\n/g, '<br>');
        
        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '');
        
        // Lists - Basic unordered lists
        html = html.replace(/^\* (.+$)/gim, '<li>$1</li>');
        html = html.replace(/^- (.+$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Numbered lists
        html = html.replace(/^\d+\. (.+$)/gim, '<li>$1</li>');
        
        // Code blocks ```
        html = html.replace(/```([^`]*?)```/gs, '<pre><code>$1</code></pre>');
        
        return html;
    }
}

// Initialize the chat when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatBGD();
});