# Claude Agent on Vercel

A Next.js application that hosts a Claude AI agent on Vercel with a simple chat interface.

## Features

- 🤖 Chat with Claude AI (using Claude 3.5 Sonnet)
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

4. **Add environment variable:**
   ```bash
   vercel env add ANTHROPIC_API_KEY
   ```
   
   When prompted:
   - Enter the value: (paste your Anthropic API key)
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

3. **Add environment variable:**
   - In the project settings, go to "Environment Variables"
   - Add `ANTHROPIC_API_KEY` with your Anthropic API key
   - Make sure it's enabled for Production, Preview, and Development

4. **Deploy:**
   - Click "Deploy"
   - Wait for the deployment to complete

## API Usage

Once deployed, you can use the API endpoint directly:

### POST /api/chat

Send messages to Claude and receive responses.

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, Claude!"
    }
  ],
  "system": "You are a helpful assistant.",
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1024
}
```

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
    "model": "claude-3-5-sonnet-20241022",
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

## Configuration

### Supported Claude Models

You can change the model in your requests:
- `claude-3-5-sonnet-20241022` (default, recommended)
- `claude-3-opus-20240229`
- `claude-3-sonnet-20240229`
- `claude-3-haiku-20240307`

### Customizing System Prompt

Pass a custom `system` parameter in your API requests to change Claude's behavior:

```json
{
  "messages": [...],
  "system": "You are a helpful coding assistant specialized in Python."
}
```

## Troubleshooting

### Environment Variables Not Working

If your API key isn't being recognized:
1. Make sure the variable is named exactly `ANTHROPIC_API_KEY`
2. Redeploy after adding environment variables: `vercel --prod`
3. Check Vercel dashboard → Project Settings → Environment Variables

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
