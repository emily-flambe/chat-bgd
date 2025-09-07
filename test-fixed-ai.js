// Test script to verify conversation history with the fixed AI worker
async function testFixedAI() {
    console.log('Testing Fixed AI Worker Context Memory...\n');
    
    const baseUrl = 'http://localhost:8787';
    
    // Test 1: First message - introduce yourself
    console.log('Test 1: Introducing myself');
    const response1 = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: 'Hi! My name is Alice and I love programming.',
            instructions: 'You are a helpful AI assistant.'
        })
    });
    const result1 = await response1.json();
    console.log('AI Response:', result1.response);
    console.log('---\n');
    
    // Test 2: Ask if AI remembers the name
    console.log('Test 2: Testing memory - asking about my name');
    const conversationHistory = [
        { role: 'user', content: 'Hi! My name is Alice and I love programming.' },
        { role: 'assistant', content: result1.response }
    ];
    
    const response2 = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: 'What is my name?',
            instructions: 'You are a helpful AI assistant.',
            conversationHistory: conversationHistory
        })
    });
    const result2 = await response2.json();
    console.log('AI Response:', result2.response);
    console.log('Does AI remember the name "Alice"?:', result2.response?.includes('Alice') ? '✅ YES!' : '❌ NO');
    console.log('---\n');
    
    // Test 3: Ask about the hobby
    console.log('Test 3: Testing memory - asking about my interests');
    conversationHistory.push(
        { role: 'user', content: 'What is my name?' },
        { role: 'assistant', content: result2.response }
    );
    
    const response3 = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: 'What do I love doing?',
            conversationHistory: conversationHistory
        })
    });
    const result3 = await response3.json();
    console.log('AI Response:', result3.response);
    console.log('Does AI remember "programming"?:', result3.response?.toLowerCase().includes('programming') ? '✅ YES!' : '❌ NO');
    console.log('---\n');
    
    console.log('Test complete! The fixed AI worker', 
        (result2.response?.includes('Alice') && result3.response?.toLowerCase().includes('programming')) 
        ? '✅ SUCCESSFULLY uses conversation history!' 
        : '❌ still has issues with conversation history.'
    );
}

// Run the test
testFixedAI().catch(console.error);