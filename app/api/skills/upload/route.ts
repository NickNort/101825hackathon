import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { loadSkillsFromDirectory, prepareSkillForUpload } from '../utils';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Security constants (reuse from chat route)
const ALLOWED_API_KEYS = process.env.ALLOWED_API_KEYS?.split(',').map(k => k.trim()) || [];

// Authentication middleware (reuse from chat route)
function authenticateRequest(request: NextRequest): { success: boolean; error?: string } {
  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey) {
    return { success: false, error: 'API key is required' };
  }

  if (!ALLOWED_API_KEYS.includes(apiKey)) {
    return { success: false, error: 'Invalid API key' };
  }

  return { success: true };
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

    // Step 2: Load skills from directory
    const skillsDir = process.env.SKILLS_DIRECTORY || 'skills';
    const skills = await loadSkillsFromDirectory(skillsDir);

    if (skills.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No skills found in directory',
        skills: []
      });
    }

    // Step 3: Upload each skill to Anthropic
    const uploadedSkills = [];
    
    for (const skill of skills) {
      try {
        console.log(`Uploading skill: ${skill.name}`);
        
        const files = await prepareSkillForUpload(skill);
        
        const uploadedSkill = await anthropic.beta.skills.create({
          display_title: skill.name,
          files: files,
          betas: ['skills-2025-10-02']
        });

        uploadedSkills.push({
          name: skill.name,
          description: skill.description,
          skillId: uploadedSkill.id,
          version: uploadedSkill.latest_version,
          directory: skill.directory
        });

        console.log(`Successfully uploaded skill: ${skill.name} (ID: ${uploadedSkill.id})`);
      } catch (error: any) {
        console.error(`Error uploading skill ${skill.name}:`, error);
        return NextResponse.json(
          { 
            success: false, 
            error: `Failed to upload skill '${skill.name}': ${error.message}` 
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${uploadedSkills.length} skills`,
      skills: uploadedSkills
    });

  } catch (error: any) {
    console.error('Error in skills upload API:', {
      message: error.message,
      name: error.name,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      { success: false, error: 'An error occurred uploading skills' },
      { status: 500 }
    );
  }
}

// Optional: Add a GET endpoint to list available skills
export async function GET(request: NextRequest) {
  try {
    // Step 1: Authentication
    const authResult = authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    // Step 2: Load skills from directory
    const skillsDir = process.env.SKILLS_DIRECTORY || 'skills';
    const skills = await loadSkillsFromDirectory(skillsDir);

    return NextResponse.json({
      success: true,
      skills: skills.map(skill => ({
        name: skill.name,
        description: skill.description,
        directory: skill.directory,
        fileCount: skill.files.length
      }))
    });

  } catch (error: any) {
    console.error('Error in skills list API:', error);
    
    return NextResponse.json(
      { success: false, error: 'An error occurred listing skills' },
      { status: 500 }
    );
  }
}
