import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  defaultHeaders: {
    'anthropic-beta': 'code-execution-2025-08-25,skills-2025-10-02,files-api-2025-04-14',
  },
});

// Rate limiting: Track requests by identifier (IP or API key)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

// Security constants
const ALLOWED_API_KEYS = process.env.ALLOWED_API_KEYS?.split(',').map(k => k.trim()) || [];
const HARDCODED_MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS_LIMIT = 1000;
const HARDCODED_SYSTEM_PROMPT = `You are a helpful AI assistant specializing in helping users create Claude Code skills.

## About Claude Code Skills

Skills are modular packages that extend Claude Code's capabilities by providing specialized knowledge, workflows, and tools. They transform Claude from a general-purpose agent into a specialized agent with domain-specific expertise.

## Skill Structure

Every skill consists of:

**SKILL.md (required)**
- YAML frontmatter with name and description
- Markdown instructions for Claude to follow
- Description should use third-person (e.g., "This skill should be used when...")

**Bundled Resources (optional)**
- scripts/ - Executable code (Python/Bash) for deterministic tasks
- references/ - Documentation loaded as needed (schemas, APIs, policies)
- assets/ - Files used in output (templates, images, boilerplate)

## Creating a Skill

1. **Understand with Examples**: Ask for concrete examples of how the skill will be used
2. **Plan Resources**: Identify what scripts, references, and assets would help
3. **Initialize**: Use init_skill.py script to create the skill structure
4. **Edit SKILL.md**: Write in imperative/infinitive form, explain purpose and usage
5. **Package**: Use package_skill.py to validate and create distributable zip
6. **Iterate**: Test and refine based on real usage

## Best Practices

- Keep SKILL.md lean - move detailed info to references/
- Use scripts/ for code that's repeatedly rewritten
- Use references/ for documentation Claude should reference
- Use assets/ for files that go into the output
- Write objectively using imperative form ("To do X, do Y")
- Make name and description specific about when to use the skill

When users ask about creating skills, guide them through understanding their use case, planning the structure, and implementing the skill components.`;

// Authentication middleware
function authenticateRequest(request: NextRequest): { success: boolean; error?: string } {
  const apiKey = request.headers.get('X-API-Key');

  // Debug logging
  console.log('Authentication attempt:', {
    receivedKey: apiKey ? `${apiKey.substring(0, 5)}...` : 'none',
    allowedKeysCount: ALLOWED_API_KEYS.length,
    allowedKeysPreview: ALLOWED_API_KEYS.map(k => `${k.substring(0, 5)}...`),
  });

  if (!apiKey) {
    return { success: false, error: 'API key is required' };
  }

  if (!ALLOWED_API_KEYS.includes(apiKey)) {
    return { success: false, error: 'Invalid API key' };
  }

  return { success: true };
}

// Rate limiting middleware
function checkRateLimit(identifier: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  // Clean up old entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  if (!record || now > record.resetTime) {
    // Reset the rate limit window
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true };
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { 
      allowed: false, 
      error: 'Rate limit exceeded. Please try again later.' 
    };
  }
  
  record.count++;
  return { allowed: true };
}

// Get client identifier for rate limiting
function getClientIdentifier(request: NextRequest): string {
  const apiKey = request.headers.get('X-API-Key');
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Use API key if available, otherwise fall back to IP
  return apiKey || ip;
}

export async function POST(request: NextRequest) {
  try {
    // Step 1: Authentication
    const authResult = authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }
    
    // Step 2: Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: rateLimitResult.error },
        { status: 429 }
      );
    }
    
    // Step 3: Parse and validate request
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required' },
        { status: 400 }
      );
    }
    
    // Validate message array size
    if (messages.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Too many messages in conversation' },
        { status: 400 }
      );
    }
    
    // Validate individual message length
    for (const msg of messages) {
      if (msg.content && typeof msg.content === 'string' && msg.content.length > 10000) {
        return NextResponse.json(
          { success: false, error: 'Message content too long' },
          { status: 400 }
        );
      }
    }

    // Step 4: Call Claude API with hardcoded secure parameters
    const message = await anthropic.messages.create({
      model: HARDCODED_MODEL,
      max_tokens: MAX_TOKENS_LIMIT,
      system: HARDCODED_SYSTEM_PROMPT,
      messages,
    });

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    // Log detailed error server-side only
    console.error('Error in chat API:', {
      message: error.message,
      name: error.name,
      timestamp: new Date().toISOString(),
    });
    
    // Return generic error to client (no sensitive details)
    return NextResponse.json(
      { success: false, error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}

// Optional: Add a GET endpoint to check if the API is running
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Claude Agent API is running',
    timestamp: new Date().toISOString(),
  });
}
