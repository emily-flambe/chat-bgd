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
    }

    bindEvents() {
        this.messageInput.addEventListener('input', () => this.handleMessageInput());
        this.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.sendButton.addEventListener('click', () => this.sendMessage());
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
                this.addMessage('assistant', response.response);
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.showError(this.getErrorMessage(error));
        } finally {
            this.setLoading(false);
        }
    }

    async callAPI(message) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit exceeded');
            } else if (response.status >= 500) {
                throw new Error('Service temporarily unavailable');
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        }

        return await response.json();
    }

    addMessage(type, content) {
        // Remove empty state if it exists
        const emptyState = this.messagesContainer.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = content;
        
        this.messagesContainer.appendChild(messageDiv);
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
}

// Initialize the chat when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatBGD();
});