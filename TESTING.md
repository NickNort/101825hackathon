# Testing Claude Code Execution API

This guide shows how to test the code execution capabilities through the API.

## Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Set up your environment variables** in `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ALLOWED_API_KEYS=test-key-123,another-key-456
   ```

## Testing Methods

### Method 1: Using the Node.js Test Script

The easiest way to test is using the provided test script:

```bash
node test-code-execution.js
```

**Before running:**
- Update `API_KEY` in `test-code-execution.js` to match one of your `ALLOWED_API_KEYS`
- Ensure the dev server is running on `localhost:3000`

The script will run three tests:
1. Simple Hello World with basic calculation
2. Factorial calculation
3. Fibonacci sequence generation

### Method 2: Using cURL

**Simple Hello World Example:**

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-key-123" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Write and execute a Python script that prints '\''Hello, World!'\'' and calculates 10 + 5"
      }
    ]
  }'
```

**More Complex Example (Data Processing):**

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-key-123" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Write Python code to calculate the sum of squares of numbers 1 through 10, then execute it"
      }
    ]
  }'
```

### Method 3: Using Postman or Similar Tools

**Endpoint:** `POST http://localhost:3000/api/chat`

**Headers:**
- `Content-Type: application/json`
- `X-API-Key: your-api-key-here`

**Body (JSON):**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Write and execute a Python script that prints 'Hello from Claude!' and calculates 2+2"
    }
  ]
}
```

### Method 4: Using Python with requests

```python
import requests
import json

API_URL = "http://localhost:3000/api/chat"
API_KEY = "test-key-123"  # Replace with your actual key

response = requests.post(
    API_URL,
    headers={
        "Content-Type": "application/json",
        "X-API-Key": API_KEY
    },
    json={
        "messages": [
            {
                "role": "user",
                "content": "Write and execute Python code that prints the first 5 prime numbers"
            }
        ]
    }
)

print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
```

## Understanding the Response

When Claude executes code, the response will include:

```json
{
  "success": true,
  "data": {
    "id": "msg_...",
    "type": "message",
    "role": "assistant",
    "content": [
      {
        "type": "text",
        "text": "I'll write and execute a Python script..."
      },
      {
        "type": "tool_use",
        "id": "toolu_...",
        "name": "code_execution",
        "input": {
          "code": "print('Hello, World!')\nresult = 2 + 2\nprint(f'2 + 2 = {result}')"
        }
      }
    ],
    "model": "claude-haiku-4-5-20251001",
    "stop_reason": "tool_use",
    ...
  }
}
```

**Key fields to look for:**
- `content[].type`: Will be "text" or "tool_use"
- `content[].name`: Will be "code_execution" for code execution tools
- `content[].input.code`: The actual code that was executed
- `stop_reason`: Will be "tool_use" when code needs to be executed

## Common Test Prompts

Here are some useful prompts to test code execution:

**Basic Tests:**
- "Execute Python code that prints 'Hello World'"
- "Calculate 123 * 456 using Python"
- "Generate a list of numbers 1-10 and sum them"

**Math/Science:**
- "Calculate the factorial of 7"
- "Find the first 10 Fibonacci numbers"
- "Calculate pi to 5 decimal places"

**Data Processing:**
- "Create a list of prime numbers up to 50"
- "Sort this list: [5, 2, 9, 1, 7] and print it"
- "Calculate mean, median, and mode of: [1, 2, 2, 3, 4, 4, 4, 5]"

## Troubleshooting

**401 Unauthorized:**
- Check that your `X-API-Key` header matches one of the keys in `ALLOWED_API_KEYS`
- Verify the environment variable is set correctly

**429 Rate Limit Exceeded:**
- Wait 1 minute and try again (rate limit: 10 requests per minute)

**500 Internal Server Error:**
- Check that `ANTHROPIC_API_KEY` is set in `.env.local`
- Verify the API key is valid
- Check server logs in the terminal

**No code execution in response:**
- Make sure your prompt explicitly asks Claude to execute code
- Try phrases like "write and execute", "run this code", "execute Python code"

## Testing in Production (Vercel)

Once deployed to Vercel:

1. Replace `http://localhost:3000` with your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Ensure environment variables are set in Vercel:
   ```bash
   vercel env add ANTHROPIC_API_KEY
   vercel env add ALLOWED_API_KEYS
   ```
3. Use the same testing methods above with the production URL

## Rate Limiting

Remember that the API enforces:
- **10 requests per minute** per API key/IP
- **Max 50 messages** per conversation
- **Max 10,000 characters** per message
- **Max 1000 tokens** in responses

Plan your tests accordingly!
