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

// GET /api/files/[fileId] - Get file metadata
export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
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

    const { fileId } = params;

    // Get file metadata using the beta API
    const file = await anthropic.beta.files.retrieveMetadata(fileId);

    return NextResponse.json({
      success: true,
      data: file
    });

  } catch (error: any) {
    console.error('Error retrieving file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve file' },
      { status: 500 }
    );
  }
}

// DELETE /api/files/[fileId] - Delete file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { fileId: string } }
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

    const { fileId } = params;

    // Delete file using the beta API
    await anthropic.beta.files.delete(fileId);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

