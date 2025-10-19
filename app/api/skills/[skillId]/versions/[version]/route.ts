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

// DELETE /api/skills/[skillId]/versions/[version] - Delete specific version
export async function DELETE(
  request: NextRequest,
  { params }: { params: { skillId: string; version: string } }
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

    const { skillId, version } = params;

    // Delete specific version using the beta API
    await anthropic.beta.skills.versions.delete(version, { skill_id: skillId });

    return NextResponse.json({
      success: true,
      message: 'Skill version deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting skill version:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete skill version' },
      { status: 500 }
    );
  }
}

