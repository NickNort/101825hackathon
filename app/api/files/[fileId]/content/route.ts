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

// GET /api/files/[fileId]/content - Download file content
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

    // Get file metadata first to determine content type and filename
    const file = await anthropic.beta.files.retrieveMetadata(fileId);
    
    // Download file content using the beta API
    const fileContent = await anthropic.beta.files.download(fileId);
    
    // Convert the response to a buffer
    const buffer = await fileContent.arrayBuffer();
    
    // Determine content type and filename
    const contentType = file.mime_type || 'application/octet-stream';
    const filename = file.filename || `file-${fileId}`;
    
    // Create response with proper headers
    const response = new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    });

    return response;

  } catch (error: any) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to download file' },
      { status: 500 }
    );
  }
}

