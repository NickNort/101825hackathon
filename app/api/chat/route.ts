import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, system, model = 'claude-3-5-sonnet-20241022', max_tokens = 1024 } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Create a message with Claude
    const message = await anthropic.messages.create({
      model,
      max_tokens,
      system: system || 'You are a helpful AI assistant.',
      messages,
    });

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    console.error('Error calling Claude API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
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
