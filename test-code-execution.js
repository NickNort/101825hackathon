/**
 * Test script for Claude Code Execution API
 *
 * This script demonstrates how to use the chat API with code execution capabilities.
 * It sends a message asking Claude to execute Python code.
 */

const API_URL = 'http://localhost:3000/api/chat'; // Change to your deployed URL for production
const API_KEY = 'your-api-key-here'; // Replace with your actual API key from ALLOWED_API_KEYS

async function testCodeExecution() {
  try {
    console.log('🚀 Testing Claude Code Execution API...\n');

    // Test 1: Simple Hello World code execution
    console.log('Test 1: Execute Python Hello World');
    const response1 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Write and execute a Python script that prints "Hello, World from Claude Code Execution!" and calculates 2+2.',
          },
        ],
      }),
    });

    const result1 = await response1.json();
    console.log('Response status:', response1.status);
    console.log('Response:', JSON.stringify(result1, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    // Test 2: More complex calculation
    console.log('Test 2: Execute Python with calculations');
    const response2 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Write and execute a Python script that calculates the factorial of 5 and prints the result.',
          },
        ],
      }),
    });

    const result2 = await response2.json();
    console.log('Response status:', response2.status);
    console.log('Response:', JSON.stringify(result2, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    // Test 3: Data visualization request
    console.log('Test 3: Request data analysis');
    const response3 = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Write and execute a Python script that creates a list of the first 10 fibonacci numbers and prints them.',
          },
        ],
      }),
    });

    const result3 = await response3.json();
    console.log('Response status:', response3.status);
    console.log('Response:', JSON.stringify(result3, null, 2));

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Run the tests
testCodeExecution();
