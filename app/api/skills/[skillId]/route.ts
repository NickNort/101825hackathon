import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Authentication middleware
function authenticateRequest(request: NextRequest): { success: boolean; error?: string } {
  const apiKey = request.headers.get('X-API-Key');
  const allowedKeys = process.env.ALLOWED_API_KEYS?.split(',').map(k => k.trim()) || [];

  if (!apiKey) {
    return { success: false, error: 'API key is required' };
  }

  if (!allowedKeys.includes(apiKey)) {
    return { success: false, error: 'Invalid API key' };
  }

  return { success: true };
}

// GET /api/skills/[skillId] - Get skill details
export async function GET(
  request: NextRequest,
  { params }: { params: { skillId: string } }
) {
  try {
    // Authentication
    const authResult = authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const { skillId } = params;

    // Get skill details using the beta API
    const skill = await anthropic.beta.skills.retrieve(skillId);

    return NextResponse.json({
      success: true,
      data: skill
    });

  } catch (error: any) {
    console.error('Error retrieving skill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve skill' },
      { status: 500 }
    );
  }
}

// DELETE /api/skills/[skillId] - Delete skill
export async function DELETE(
  request: NextRequest,
  { params }: { params: { skillId: string } }
) {
  try {
    // Authentication
    const authResult = authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const { skillId } = params;

    // Delete skill using the beta API
    await anthropic.beta.skills.delete(skillId);

    return NextResponse.json({
      success: true,
      message: 'Skill deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting skill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete skill' },
      { status: 500 }
    );
  }
}

