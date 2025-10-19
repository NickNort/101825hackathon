# Claude Agent on Vercel

A Next.js application that hosts a Claude AI agent on Vercel with a simple chat interface.

**Looking to use the AI agent?** See the [User Guide](./USER_GUIDE.md) for detailed instructions on how to interact with Claude via the web interface or API.

## Features

- 🤖 Chat with Claude AI (using Claude Haiku 4.5)
- 🛠️ Specialized in helping create Claude Code skills
- 🎯 **Skills API Support** - Use Anthropic and custom skills in conversations
- 📁 **File Generation & Download** - Download files created by skills
- 🔄 **Container Management** - Multi-turn conversations with persistent context
- 🚀 Deployed on Vercel for global availability
- 💬 Simple, clean chat interface with skills selection
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

## API Usage

Once deployed, you can use the API endpoint directly:

### POST /api/chat

Send messages to Claude and receive responses with optional skills support.

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
  ],
  "skills": [
    {
      "type": "anthropic",
      "skill_id": "skill_pptx_20241002"
    },
    {
      "type": "custom",
      "skill_id": "your_custom_skill_id"
    }
  ],
  "session_id": "optional_session_id"
}
```

**Note:** The `system`, `model`, and `max_tokens` parameters are now hardcoded server-side for security:
- Model: `claude-haiku-4-5-20251001`
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
    "model": "claude-haiku-4-5-20251001",
    "stop_reason": "end_turn",
    "usage": {
      "input_tokens": 10,
      "output_tokens": 20
    }
  },
  "container_id": "container_1234567890_abcdef",
  "file_ids": ["file-abc123", "file-def456"],
  "requires_continuation": false
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

## Skills API

### GET /api/skills

List all available skills (Anthropic and custom).

**Query Parameters:**
- `source` (optional): Filter by source (`anthropic` or `custom`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "skill_pptx_20241002",
      "name": "PowerPoint Generator",
      "description": "Creates PowerPoint presentations",
      "source": "anthropic"
    }
  ],
  "count": 1
}
```

### POST /api/skills

Create a new custom skill.

**Request:** Multipart form data with files (must include `SKILL.md`)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "skill_custom_123",
    "name": "My Custom Skill",
    "description": "Custom skill description",
    "source": "custom",
    "created_at": "2025-01-19T07:37:00.000Z",
    "versions": ["1.0.0"]
  }
}
```

### GET /api/skills/[skillId]

Get details of a specific skill.

### DELETE /api/skills/[skillId]

Delete a skill (must delete all versions first).

### GET /api/skills/[skillId]/versions

List all versions of a skill.

### POST /api/skills/[skillId]/versions

Create a new version of a skill.

### DELETE /api/skills/[skillId]/versions/[version]

Delete a specific version of a skill.

## Files API

### GET /api/files

List all files.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "file-abc123",
      "filename": "presentation.pptx",
      "content_type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "created_at": "2025-01-19T07:37:00.000Z"
    }
  ],
  "count": 1
}
```

### GET /api/files/[fileId]

Get metadata for a specific file.

### DELETE /api/files/[fileId]

Delete a file.

### GET /api/files/[fileId]/content

Download file content with proper headers for browser download.

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
- Model is hardcoded to `claude-haiku-4-5-20251001`
- Max tokens capped at 1000
- System prompt is fixed server-side
- Beta features are enabled for skills and files API
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
- **Model:** `claude-haiku-4-5-20251001`
- **Max Tokens:** 1000
- **System Prompt:** Specialized for Claude Code skill creation guidance
- **Beta Features:** Skills API, Files API, and Code Execution enabled

The system prompt includes comprehensive knowledge about creating Claude Code skills, including skill structure, best practices, and the creation process. These settings cannot be changed via API requests to prevent abuse and cost overruns.

### Skills Support

The application supports both Anthropic-provided skills and custom skills:
- **Anthropic Skills:** PowerPoint, Excel, Word, PDF generation
- **Custom Skills:** User-uploaded skills with SKILL.md files
- **Container Management:** Persistent conversation context across multiple turns
- **File Generation:** Automatic download links for files created by skills

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
│   │   ├── chat/
│   │   │   └── route.ts       # Claude chat API with skills support
│   │   ├── skills/
│   │   │   ├── route.ts       # Skills CRUD operations
│   │   │   └── [skillId]/
│   │   │       ├── route.ts   # Individual skill operations
│   │   │       └── versions/
│   │   │           ├── route.ts           # Skill versions list/create
│   │   │           └── [version]/
│   │   │               └── route.ts       # Version deletion
│   │   └── files/
│   │       ├── route.ts       # Files listing
│   │       └── [fileId]/
│   │           ├── route.ts   # File metadata/delete
│   │           └── content/
│   │               └── route.ts           # File download
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Chat interface with skills UI
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
