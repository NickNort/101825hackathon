import Anthropic, { toFile } from '@anthropic-ai/sdk';
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

// GET /api/skills/[skillId]/versions - List skill versions
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

    // Get skill versions using the beta API
    const versions = await anthropic.beta.skills.versions.list(skillId);

    return NextResponse.json({
      success: true,
      data: versions.data,
      count: versions.data.length
    });

  } catch (error: any) {
    console.error('Error listing skill versions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list skill versions' },
      { status: 500 }
    );
  }
}

// POST /api/skills/[skillId]/versions - Create new version
export async function POST(
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

    // Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate files
    for (const file of files) {
      if (file.size > 8 * 1024 * 1024) { // 8MB limit
        return NextResponse.json(
          { success: false, error: `File ${file.name} exceeds 8MB limit` },
          { status: 400 }
        );
      }
    }

    // Check for SKILL.md
    const skillMdFile = files.find(file => file.name === 'SKILL.md');
    if (!skillMdFile) {
      return NextResponse.json(
        { success: false, error: 'SKILL.md file is required' },
        { status: 400 }
      );
    }

    // Convert files to the format expected by the API
    const skillFiles = await Promise.all(
      files.map(async (file) => {
        const buffer = await file.arrayBuffer();
        return toFile(Buffer.from(buffer), file.name, {
          type: file.type || 'application/octet-stream'
        });
      })
    );

    // Create new version using the beta API
    const version = await anthropic.beta.skills.versions.create(skillId, {
      files: skillFiles
    });

    return NextResponse.json({
      success: true,
      data: {
        id: version.id,
        skill_id: version.skill_id,
        version: version.version,
        created_at: version.created_at
      }
    });

  } catch (error: any) {
    console.error('Error creating skill version:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create skill version' },
      { status: 500 }
    );
  }
}

