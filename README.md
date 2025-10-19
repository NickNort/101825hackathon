# Claude Agent on Vercel

A Next.js application that hosts a Claude AI agent on Vercel with a simple chat interface.

**Looking to use the AI agent?** See the [User Guide](./USER_GUIDE.md) for detailed instructions on how to interact with Claude via the web interface or API.

## Features

- 🤖 Chat with Claude AI (using Claude Sonnet 4.5)
- 🛠️ Specialized in helping create Claude Code skills
- 🧠 Custom Skills support - load and use skills from `skills/` directory
- 🚀 Deployed on Vercel for global availability
- 💬 Simple, clean chat interface
- 🔒 Secure API key handling via environment variables
- ⚡ Fast and responsive API endpoints

## Quick Start

### Prerequisites

- Node.js 18+ installed
- An Anthropic API key ([get one here](https://console.anthropic.com/))
- A Vercel account ([sign up here](https://vercel.com/signup))

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ALLOWED_API_KEYS=your_secure_key_1,your_secure_key_2
   ```
   
   **Important:** Generate secure API keys for client authentication:
   ```bash
   # Generate a secure key (Linux/macOS)
   openssl rand -hex 32
   
   # Or use Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```
   
   Follow the prompts. For the first deployment, answer:
   - Set up and deploy? `Y`
   - Which scope? (select your account)
   - Link to existing project? `N`
   - What's your project's name? (press Enter to use default)
   - In which directory is your code located? `./`

4. **Add environment variables:**
   ```bash
   vercel env add ANTHROPIC_API_KEY
   ```
   
   When prompted:
   - Enter the value: (paste your Anthropic API key)
   - Expose variable to: Select all environments (Production, Preview, Development)
   
   Then add the client API keys:
   ```bash
   vercel env add ALLOWED_API_KEYS
   ```
   
   When prompted:
   - Enter the value: (comma-separated list of secure keys, e.g., key1,key2,key3)
   - Expose variable to: Select all environments (Production, Preview, Development)

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import project to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure your project:
     - Framework Preset: Next.js (auto-detected)
     - Root Directory: ./
     - Build Command: `npm run build` (auto-detected)
     - Output Directory: .next (auto-detected)

3. **Add environment variables:**
   - In the project settings, go to "Environment Variables"
   - Add `ANTHROPIC_API_KEY` with your Anthropic API key
   - Add `ALLOWED_API_KEYS` with your comma-separated client API keys
   - Make sure both are enabled for Production, Preview, and Development

4. **Deploy:**
   - Click "Deploy"
   - Wait for the deployment to complete

## Custom Skills Support

This agent supports custom skills loaded from a `skills/` directory. Skills extend Claude's capabilities with specialized knowledge, workflows, and tools.

### Creating Custom Skills

1. **Create a skill directory** in the `skills/` folder:
   ```
   skills/
   ├── my-skill/
   │   ├── SKILL.md          # Required: Skill instructions with YAML frontmatter
   │   ├── scripts/          # Optional: Executable code
   │   ├── references/       # Optional: Documentation and schemas
   │   └── assets/           # Optional: Templates and files
   ```

2. **Write SKILL.md** with YAML frontmatter:
   ```markdown
   ---
   name: My Custom Skill
   description: This skill helps with specific tasks...
   ---
   
   # My Custom Skill
   
   This skill provides...
   ```

3. **Upload skills** using the API:
   ```bash
   curl -X POST https://your-app.vercel.app/api/skills/upload \
     -H "X-API-Key: your_api_key"
   ```

4. **Skills are automatically included** in chat requests

### Example Skill Structure

See `skills/example-skill/` for a complete example including:
- **SKILL.md**: Main skill instructions
- **scripts/**: Python analysis functions
- **references/**: Data analysis guide
- **assets/**: Report templates

### Skills API Endpoints

#### POST /api/skills/upload
Upload all skills from the `skills/` directory to Anthropic.

**Authentication Required:** Same as chat endpoint

**Response:**
```json
{
  "success": true,
  "message": "Successfully uploaded 2 skills",
  "skills": [
    {
      "name": "Data Analysis Helper",
      "skillId": "skill_01AbCdEfGhIjKlMnOpQrStUv",
      "version": "1759178010641129"
    }
  ]
}
```

#### GET /api/skills/upload
List available skills in the `skills/` directory.

**Response:**
```json
{
  "success": true,
  "skills": [
    {
      "name": "Data Analysis Helper",
      "description": "This skill provides tools for data analysis...",
      "directory": "example-skill",
      "fileCount": 4
    }
  ]
}
```

### Skills Directory Structure

Each skill must be in its own subdirectory with:

- **SKILL.md** (required): Main skill file with YAML frontmatter
- **scripts/** (optional): Executable code (Python, Bash, etc.)
- **references/** (optional): Documentation, schemas, APIs
- **assets/** (optional): Templates, images, boilerplate files

### Skill Development Best Practices

1. **Keep SKILL.md lean** - Move detailed info to references/
2. **Use scripts/** for code that's repeatedly rewritten
3. **Use references/** for documentation Claude should reference
4. **Use assets/** for files that go into the output
5. **Write objectively** using imperative form ("To do X, do Y")
6. **Make descriptions specific** about when to use the skill

For detailed skill authoring guidance, see [skills-api-guide.md](./skills-api-guide.md).

## API Usage

Once deployed, you can use the API endpoint directly:

### POST /api/chat

Send messages to Claude and receive responses.

**Authentication Required:** All requests must include an `X-API-Key` header with a valid API key.

**Rate Limiting:** 10 requests per minute per API key/IP address.

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, Claude!"
    }
  ]
}
```

**Note:** The `system`, `model`, and `max_tokens` parameters are now hardcoded server-side for security:
- Model: `claude-sonnet-4-5-20250929`
- Max Tokens: 1000
- System Prompt: Specialized for Claude Code skill creation guidance

**Response:**
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
        "text": "Hello! How can I help you today?"
      }
    ],
    "model": "claude-sonnet-4-5-20250929",
    "stop_reason": "end_turn",
    "usage": {
      "input_tokens": 10,
      "output_tokens": 20
    }
  }
}
```

**Example with curl:**
```bash
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_authorized_api_key" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is the capital of France?"}
    ]
  }'
```

### GET /api/chat

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Claude Agent API is running",
  "timestamp": "2025-10-19T07:37:00.000Z"
}
```

## Security Features

This application implements multiple layers of security:

### Authentication
- **API Key Requirement:** All requests must include a valid API key in the `X-API-Key` header
- **Server-Side Validation:** API keys are validated against environment variables
- Keys should be generated using secure random methods (see setup instructions)

### Rate Limiting
- **10 requests per minute** per API key or IP address
- In-memory rate limiting (resets on server restart)
- Automatic cleanup of old entries

### Input Validation
- Maximum 50 messages per conversation
- Maximum 10,000 characters per message
- Strict validation of message structure

### Parameter Protection
- Model is hardcoded to `claude-3-5-sonnet-20241022`
- Max tokens capped at 1000
- System prompt is fixed server-side
- Users cannot override these settings

### Security Headers
- X-Frame-Options: DENY (prevents clickjacking)
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- Referrer-Policy
- Permissions-Policy

### Error Handling
- Generic error messages sent to clients
- Detailed errors logged server-side only
- No stack traces or sensitive information exposed

## Configuration

The application uses hardcoded security settings:
- **Model:** `claude-sonnet-4-5-20250929`
- **Max Tokens:** 1000
- **System Prompt:** Specialized for Claude Code skill creation guidance

The system prompt includes comprehensive knowledge about creating Claude Code skills, including skill structure, best practices, and the creation process. These settings cannot be changed via API requests to prevent abuse and cost overruns.

## Troubleshooting

### Environment Variables Not Working

If your API keys aren't being recognized:
1. Make sure variables are named exactly `ANTHROPIC_API_KEY` and `ALLOWED_API_KEYS`
2. For `ALLOWED_API_KEYS`, use comma-separated values with no spaces (or trim spaces)
3. Redeploy after adding environment variables: `vercel --prod`
4. Check Vercel dashboard → Project Settings → Environment Variables

### Authentication Errors

If you get "Invalid API key" errors:
1. Verify the API key is included in `ALLOWED_API_KEYS` environment variable
2. Check that you're passing the key in the `X-API-Key` header
3. Ensure there are no extra spaces in the key
4. Generate a new key if needed: `openssl rand -hex 32`

### Rate Limit Errors

If you get "Rate limit exceeded" errors:
1. Wait 60 seconds before retrying
2. Reduce request frequency
3. Check if multiple clients are using the same API key
4. Consider increasing the rate limit in `app/api/chat/route.ts` if needed

### Build Errors

If you get build errors during deployment:
1. Make sure all dependencies are in `package.json`
2. Try building locally first: `npm run build`
3. Check Vercel build logs for specific errors

### API Errors

If you get 500 errors from the API:
1. Check that your Anthropic API key is valid
2. Check the Vercel function logs in the dashboard
3. Ensure you're not exceeding Anthropic API rate limits

## Project Structure

```
.
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts       # Claude API endpoint
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Chat interface
├── next.config.js             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── vercel.json                # Vercel configuration
├── package.json               # Dependencies
└── README.md                  # This file
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **AI SDK:** Anthropic SDK
- **Hosting:** Vercel
- **Runtime:** Node.js

## License

MIT

## Resources

- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

## Support

For issues or questions:
- Anthropic API: [Anthropic Support](https://support.anthropic.com/)
- Vercel: [Vercel Support](https://vercel.com/support)
- Next.js: [Next.js GitHub](https://github.com/vercel/next.js)
