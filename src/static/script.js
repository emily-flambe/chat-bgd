class ChatBGD {
    constructor() {
        this.apiEndpoint = '/api/chat';
        this.messages = [];
        
        this.initializeElements();
        this.bindEvents();
        this.autoResizeTextarea();
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
    }

    bindEvents() {
        this.messageInput.addEventListener('input', () => this.handleMessageInput());
        this.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
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

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message) return;
        if (message.length > 4000) {
            this.showError('Message too long. Maximum 4000 characters.');
            return;
        }

        // Clear input and show user message
        this.messageInput.value = '';
        this.handleMessageInput();
        this.addMessage('user', message);
        this.setLoading(true);

        try {
            const response = await this.callAPI(message);
            if (response.error) {
                this.showError(response.error);
            } else {
                this.addMessage('assistant', response.response, response.reasoning);
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.showError(this.getErrorMessage(error));
        } finally {
            this.setLoading(false);
        }
    }

    async callAPI(message) {
        console.log('🔍 Frontend: Starting API call');
        console.log('🔍 Frontend: API Endpoint:', this.apiEndpoint);
        console.log('🔍 Frontend: Message:', message);
        console.log('🔍 Frontend: Current URL:', window.location.href);
        
        const requestBody = { message };
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

    addMessage(type, content, reasoning = null) {
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
                    this.showReasoningModal(reasoning);
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

    showReasoningModal(reasoning) {
        this.reasoningModalBody.textContent = reasoning || 'No reasoning available';
        this.reasoningModal.classList.add('show');
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }

    closeReasoningModal() {
        this.reasoningModal.classList.remove('show');
        // Restore body scroll
        document.body.style.overflow = '';
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