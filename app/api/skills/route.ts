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

// GET /api/skills - List all skills
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const authResult = authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source'); // 'custom' or 'anthropic'

    // List skills using the beta API
    const skills = await anthropic.beta.skills.list();

    let filteredSkills = skills.data;

    // Filter by source if specified
    if (source === 'custom') {
      filteredSkills = skills.data.filter(skill => skill.source === 'custom');
    } else if (source === 'anthropic') {
      filteredSkills = skills.data.filter(skill => skill.source === 'anthropic');
    }

    return NextResponse.json({
      success: true,
      data: filteredSkills,
      count: filteredSkills.length
    });

  } catch (error: any) {
    console.error('Error listing skills:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list skills' },
      { status: 500 }
    );
  }
}

// POST /api/skills - Create new custom skill
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const authResult = authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

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
        return {
          name: file.name,
          content: Buffer.from(buffer),
          content_type: file.type || 'application/octet-stream'
        };
      })
    );

    // Create skill using the beta API
    const skill = await anthropic.beta.skills.create({
      files: skillFiles
    });

    return NextResponse.json({
      success: true,
      data: {
        id: skill.id,
        name: skill.name,
        description: skill.description,
        source: skill.source,
        created_at: skill.created_at,
        versions: skill.versions
      }
    });

  } catch (error: any) {
    console.error('Error creating skill:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create skill' },
      { status: 500 }
    );
  }
}
