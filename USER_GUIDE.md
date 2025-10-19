# User Guide: How to Use the Claude AI Agent

This guide explains how to interact with the Claude AI agent through this application, whether you're using the web interface or making API calls programmatically.

## Table of Contents
- [Getting Started with the Web Interface](#getting-started-with-the-web-interface)
- [Using the API Programmatically](#using-the-api-programmatically)
- [Creating Claude Code Skills](#creating-claude-code-skills)
- [Best Practices for Effective Conversations](#best-practices-for-effective-conversations)
- [Understanding Limitations](#understanding-limitations)
- [Common Use Cases](#common-use-cases)
- [Troubleshooting](#troubleshooting)

---

## Getting Started with the Web Interface

### Step 1: Access the Application

Navigate to the application URL in your web browser:
- **Local development:** http://localhost:3000
- **Production:** Your Vercel deployment URL (e.g., https://your-app.vercel.app)

### Step 2: Enter Your API Key

When you first open the application, you'll see an API key input field:

1. **Obtain an API key** from your system administrator or the person who deployed the application
2. **Enter the key** in the "API Key" field at the top of the page
3. The key is stored in your browser session and will be required for all messages

**Security Note:** Your API key is sent with each request but is never stored on the server. It's only kept in your browser's memory during your session.

### Step 3: Start Chatting

1. **Type your message** in the input box at the bottom of the screen
2. **Press Enter** or click the "Send" button
3. **Wait for Claude's response** (you'll see "Claude is thinking..." while processing)
4. **Continue the conversation** - your message history is maintained throughout the session

### Step 4: Conversation Management

**Important behaviors to understand:**

- **Session persistence:** Your conversation stays active as long as you keep the browser tab open
- **Refresh resets conversation:** Refreshing the page or closing the tab will clear your conversation history
- **No backend storage:** Messages are not saved on the server, only in your browser's memory
- **Rate limits:** You can send up to 10 messages per minute

---

## Using the API Programmatically

You can interact with the Claude AI agent programmatically by making HTTP requests to the `/api/chat` endpoint.

### Basic API Request

**Endpoint:** `POST /api/chat`

**Required Headers:**
```
Content-Type: application/json
X-API-Key: your_authorized_api_key
```

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Your message here"
    }
  ]
}
```

### Example: JavaScript/TypeScript

```javascript
async function chatWithClaude(message, apiKey, conversationHistory = []) {
  const messages = [
    ...conversationHistory,
    { role: 'user', content: message }
  ];

  const response = await fetch('https://your-app.vercel.app/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({ messages }),
  });

  const data = await response.json();

  if (response.ok && data.success) {
    const assistantMessage = data.data.content[0].text;
    return {
      message: assistantMessage,
      updatedHistory: [...messages, { role: 'assistant', content: assistantMessage }]
    };
  } else {
    throw new Error(data.error || 'Request failed');
  }
}

// Usage
const apiKey = 'your_api_key_here';
let history = [];

// First message
const result1 = await chatWithClaude('Hello, Claude!', apiKey, history);
console.log('Claude:', result1.message);
history = result1.updatedHistory;

// Follow-up message (maintains context)
const result2 = await chatWithClaude('Tell me a joke', apiKey, history);
console.log('Claude:', result2.message);
history = result2.updatedHistory;
```

### Example: Python

```python
import requests
import json

class ClaudeAgent:
    def __init__(self, api_url, api_key):
        self.api_url = api_url
        self.api_key = api_key
        self.conversation_history = []

    def send_message(self, message):
        """Send a message to Claude and get a response."""
        self.conversation_history.append({
            'role': 'user',
            'content': message
        })

        response = requests.post(
            f'{self.api_url}/api/chat',
            headers={
                'Content-Type': 'application/json',
                'X-API-Key': self.api_key
            },
            json={'messages': self.conversation_history}
        )

        if response.status_code == 200:
            data = response.json()
            if data['success']:
                assistant_message = data['data']['content'][0]['text']
                self.conversation_history.append({
                    'role': 'assistant',
                    'content': assistant_message
                })
                return assistant_message
        elif response.status_code == 401:
            raise Exception('Invalid API key')
        elif response.status_code == 429:
            raise Exception('Rate limit exceeded. Please wait and try again.')
        else:
            raise Exception(f'Request failed: {response.text}')

    def reset_conversation(self):
        """Clear the conversation history."""
        self.conversation_history = []

# Usage
agent = ClaudeAgent('https://your-app.vercel.app', 'your_api_key_here')

# Send messages
response1 = agent.send_message('What is Python?')
print(f'Claude: {response1}')

response2 = agent.send_message('Can you give me an example?')
print(f'Claude: {response2}')

# Start fresh
agent.reset_conversation()
```

### Example: cURL

```bash
# Single message
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is the weather like?"}
    ]
  }'

# Multi-turn conversation
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key_here" \
  -d '{
    "messages": [
      {"role": "user", "content": "Tell me about Paris"},
      {"role": "assistant", "content": "Paris is the capital of France..."},
      {"role": "user", "content": "What about its famous landmarks?"}
    ]
  }'
```

---

## Creating Claude Code Skills

This AI agent specializes in helping you create Claude Code skills - modular packages that extend Claude Code's capabilities with specialized knowledge and workflows.

### What are Claude Code Skills?

Skills are self-contained packages that provide Claude with:
- **Specialized workflows** - Multi-step procedures for specific domains
- **Tool integrations** - Instructions for working with specific file formats or APIs
- **Domain expertise** - Company-specific knowledge, schemas, business logic
- **Bundled resources** - Scripts, references, and assets for complex tasks

### Getting Started with Skill Creation

**Step 1: Describe Your Use Case**

Start by explaining what you want the skill to do:

**Example prompts:**
- "I want to create a skill that helps with rotating PDF files"
- "I need a skill for querying our company's BigQuery database"
- "Help me build a skill that generates frontend webapps with a standard template"

**Step 2: Provide Examples**

The agent will ask for concrete examples of how you envision using the skill:

```
You: "I want to create a skill for PDF editing"
Agent: "What functionality should this skill support? Can you give examples?"
You: "Users might say 'rotate this PDF 90 degrees' or 'merge these two PDFs'"
```

**Step 3: Plan the Structure**

Together with the agent, you'll identify what resources the skill needs:
- **scripts/** - Reusable Python/Bash code for deterministic tasks
- **references/** - Documentation like API schemas or company policies
- **assets/** - Templates, images, or boilerplate code

**Step 4: Implementation**

The agent will guide you through:
1. Using `init_skill.py` to create the skill structure
2. Writing the SKILL.md with proper YAML frontmatter
3. Creating necessary scripts, references, and assets
4. Following best practices for skill development

**Step 5: Packaging**

Learn how to package your skill for distribution:
```bash
scripts/package_skill.py path/to/your-skill
```

### Skill Structure Example

Here's what a complete skill looks like:

```
my-skill/
├── SKILL.md                    # Main skill file
│   ├── YAML frontmatter        # name, description
│   └── Markdown instructions   # How Claude should use the skill
├── scripts/
│   └── helper_script.py        # Executable code
├── references/
│   └── api_docs.md            # Reference documentation
└── assets/
    └── template.html           # Files for output
```

### Example Conversation: Creating a PDF Rotation Skill

```
You: "I want to create a skill for rotating PDF files"

Agent: "Great! Can you describe how users would interact with this skill?
       What would they say to trigger it?"

You: "They might say 'rotate this PDF 90 degrees clockwise' or
     'turn invoice.pdf upside down'"

Agent: "Perfect. To handle PDF rotation, we'll need:
       1. A Python script in scripts/rotate_pdf.py that uses PyPDF2
       2. SKILL.md that explains when and how to use this script

       Let me help you create this. First, run:
       scripts/init_skill.py pdf-rotator --path ./my-skills"

[Conversation continues with implementation details]
```

### Tips for Effective Skill Creation

1. **Start Simple**: Begin with a narrow use case and expand later
2. **Use Concrete Examples**: Real-world examples help design better skills
3. **Separate Concerns**:
   - Put reusable code in scripts/
   - Put documentation in references/
   - Put output templates in assets/
4. **Iterate**: Test your skill and refine based on real usage
5. **Write Clearly**: Use imperative form ("To rotate a PDF, run...") not second person

### Common Skill Types

**Tool Integration Skills**
- Excel/CSV manipulation
- PDF processing
- Image editing
- API clients

**Domain Knowledge Skills**
- Company database schemas
- Business logic and policies
- Industry-specific workflows
- Style guides and templates

**Workflow Skills**
- Code review processes
- Documentation generation
- Testing frameworks
- Deployment procedures

### Getting Help

Simply ask the agent questions like:
- "How do I structure a skill for X?"
- "What should go in scripts vs references?"
- "Can you help me write the SKILL.md?"
- "How do I package my skill for distribution?"

The agent has comprehensive knowledge about skill creation and can guide you through the entire process.

---

## Best Practices for Effective Conversations

### 1. Be Clear and Specific

**Good:** "Can you help me write a Python function that calculates the factorial of a number using recursion?"

**Less effective:** "Help me with Python"

### 2. Provide Context

When asking follow-up questions, the AI maintains context from previous messages in the same session.

**Example conversation:**
- You: "I'm building a web application with React"
- Claude: "Great! What would you like to know about React?"
- You: "How do I handle form validation?" _(Claude knows you're asking about React)_

### 3. Break Down Complex Tasks

For complex requests, break them into smaller steps:

**Instead of:**
"Build me a complete e-commerce website"

**Try:**
1. "Help me design the database schema for a product catalog"
2. "Now help me create an API endpoint for product listings"
3. "How should I implement the shopping cart functionality?"

### 4. Ask for Clarification

If Claude's response isn't what you expected, ask for clarification:
- "Can you explain that in simpler terms?"
- "Can you provide an example?"
- "What are the trade-offs of this approach?"

### 5. Iterate and Refine

Build on previous responses:
- "Can you make that function more efficient?"
- "What if we also needed to handle edge case X?"
- "Can you add error handling to that code?"

---

## Understanding Limitations

### Technical Limitations

**Rate Limiting:**
- Maximum 10 requests per minute per API key or IP address
- If exceeded, wait 60 seconds before retrying

**Message Constraints:**
- Maximum 50 messages per conversation (total user + assistant messages)
- Maximum 10,000 characters per individual message
- Conversations reset on page refresh (web interface only)

**Response Constraints:**
- Maximum 1000 tokens (~750 words) per response
- Model is fixed: Claude 3.5 Sonnet (cannot be changed via requests)

### Capability Limitations

**What Claude CAN do:**
- Answer questions and explain concepts
- Help with coding and debugging
- Analyze text and data
- Provide creative writing assistance
- Translate languages
- Summarize information
- Perform calculations and logical reasoning

**What Claude CANNOT do:**
- Access external websites or APIs (besides this conversation)
- Remember conversations across different sessions
- Store or retrieve user data
- Execute code or perform actions outside this interface
- Access real-time information (knowledge cutoff: January 2025)
- Browse the internet or access external databases

---

## Common Use Cases

### 1. Code Assistance

**Example prompts:**
- "Review this JavaScript code and suggest improvements"
- "Debug this Python error: [paste error message]"
- "Write a SQL query to find users who signed up last month"
- "Explain how async/await works in JavaScript"

### 2. Learning and Explanations

**Example prompts:**
- "Explain machine learning to a beginner"
- "What's the difference between REST and GraphQL?"
- "How does HTTPS encryption work?"
- "Teach me the basics of recursion with examples"

### 3. Writing and Content Creation

**Example prompts:**
- "Help me write a professional email to a client about a project delay"
- "Brainstorm 10 blog post ideas about web development"
- "Improve this paragraph for clarity: [paste text]"
- "Create a product description for [product details]"

### 4. Data Analysis and Problem Solving

**Example prompts:**
- "Analyze these sales figures and identify trends: [data]"
- "Help me design a solution for [problem description]"
- "What are the pros and cons of using microservices architecture?"
- "Calculate the ROI for this investment scenario: [details]"

### 5. Research and Summarization

**Example prompts:**
- "Summarize the key points of this article: [paste text]"
- "What are the current best practices for API security?"
- "Compare Python and Java for backend development"
- "Explain the concept of quantum computing in simple terms"

---

## Troubleshooting

### "Please enter your API key" Error

**Problem:** You're trying to send a message without an API key

**Solution:**
1. Ensure you've entered an API key in the API Key field at the top
2. Verify the key with your administrator if it's not working

### "Invalid API key" Error

**Problem:** The API key you entered is not authorized

**Solutions:**
1. Double-check that you copied the entire key correctly
2. Ensure there are no extra spaces before or after the key
3. Contact your administrator to verify the key is in the authorized list
4. Request a new API key if needed

### "Rate limit exceeded" Error

**Problem:** You've sent more than 10 requests in the last minute

**Solutions:**
1. Wait 60 seconds before sending your next message
2. Space out your requests if you're making automated calls
3. Contact your administrator if you need a higher rate limit

### Messages Not Sending

**Problem:** Clicking "Send" doesn't do anything

**Possible causes and solutions:**
1. **Empty message:** Make sure you've typed something in the input box
2. **No API key:** Ensure you've entered your API key
3. **Still loading:** Wait for the current message to finish processing
4. **Network issue:** Check your internet connection
5. **Browser console:** Open developer tools (F12) and check for errors

### Conversation History Lost

**Problem:** Your previous messages disappeared

**Explanation:** This is expected behavior. The conversation is stored only in your browser's memory.

**When this happens:**
- Refreshing the page
- Closing the browser tab
- Browser crash
- Clearing browser cache

**Solution:** Keep the tab open to maintain conversation context. For important conversations, consider:
- Copying messages to a text file
- Taking screenshots
- Using the programmatic API with your own conversation storage

### Response Cut Off

**Problem:** Claude's response seems incomplete

**Cause:** Hit the 1000-token maximum response length

**Solutions:**
1. Ask Claude to continue: "Please continue where you left off"
2. Request a more concise answer: "Can you summarize that in fewer words?"
3. Break down your question into smaller parts

### Unexpected Responses

**Problem:** Claude's answer doesn't match what you asked

**Solutions:**
1. Rephrase your question more clearly
2. Provide more context or details
3. Ask a follow-up: "I was asking about X, not Y"
4. Start a new conversation (refresh page) if context is confused

---

## Getting Help

### For API Key Issues
Contact your system administrator or the person who deployed this application.

### For Technical Issues
Check the application logs if you have access, or report issues to your technical support team.

### For Usage Questions
Refer to this guide or ask Claude directly in the chat interface: "How do I [task]?"

---

## Tips for Power Users

### 1. Maintain Conversation Context

The AI works best when it has context. Structure longer interactions as:
1. Establish context first
2. Ask specific questions
3. Build on previous answers

### 2. Use Conversation History Strategically

Since you have a 50-message limit:
- Refresh to start fresh when changing topics completely
- Keep conversations focused on one topic when possible
- Summarize key points before starting a new sub-topic

### 3. Format Your Input

For better responses with code or data:
- Use markdown formatting in your messages
- Clearly separate code from explanatory text
- Use numbered lists for step-by-step questions

### 4. Leverage Programmatic Access

For repetitive tasks:
- Build wrapper scripts using the API examples above
- Implement your own conversation storage
- Create custom integrations with your workflows

### 5. Optimize for Rate Limits

When making programmatic calls:
- Implement exponential backoff on rate limit errors
- Queue requests instead of sending bursts
- Cache responses for repeated questions

---

## Privacy and Security

### What Gets Sent
- Your messages and conversation history
- Your API key (in request headers)
- Your IP address (for rate limiting)

### What's NOT Stored
- Conversations are not saved on the server
- Message history is only in your browser during the session
- API keys are validated but not logged

### Best Practices
- Don't share your API key with others
- Don't include sensitive personal information in messages
- Refresh your session when using shared computers
- Use HTTPS URLs (enforced in production)

---

## Changelog

**v1.0** - Initial release
- Basic chat interface
- API key authentication
- Rate limiting
- Hardcoded model parameters for security

---

For technical documentation about deployment and configuration, see [README.md](./README.md).

For developer documentation about the codebase architecture, see [CLAUDE.md](./CLAUDE.md).
