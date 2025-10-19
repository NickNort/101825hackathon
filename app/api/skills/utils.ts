import fs from 'fs';
import path from 'path';
import { toFile } from '@anthropic-ai/sdk';

export interface SkillFile {
  name: string;
  content: Buffer;
  path: string;
}

export interface Skill {
  name: string;
  description: string;
  files: SkillFile[];
  directory: string;
}

/**
 * Parse YAML frontmatter from SKILL.md content
 */
export function parseSkillMetadata(content: string): { name: string; description: string } {
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  
  if (!frontmatterMatch) {
    throw new Error('SKILL.md must contain YAML frontmatter with name and description');
  }
  
  const frontmatter = frontmatterMatch[1];
  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descriptionMatch = frontmatter.match(/^description:\s*(.+)$/m);
  
  if (!nameMatch || !descriptionMatch) {
    throw new Error('SKILL.md frontmatter must include both name and description fields');
  }
  
  return {
    name: nameMatch[1].trim(),
    description: descriptionMatch[1].trim()
  };
}

/**
 * Load all files from a skill directory
 */
async function loadSkillFiles(skillDir: string): Promise<SkillFile[]> {
  const files: SkillFile[] = [];
  
  async function scanDirectory(dir: string, relativePath: string = ''): Promise<void> {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const filePath = relativePath ? path.join(relativePath, entry.name) : entry.name;
      
      if (entry.isDirectory()) {
        await scanDirectory(fullPath, filePath);
      } else {
        const content = await fs.promises.readFile(fullPath);
        files.push({
          name: entry.name,
          content,
          path: filePath
        });
      }
    }
  }
  
  await scanDirectory(skillDir);
  return files;
}

/**
 * Load all skills from the skills directory
 */
export async function loadSkillsFromDirectory(skillsDir: string = 'skills'): Promise<Skill[]> {
  const skills: Skill[] = [];
  
  try {
    // Check if skills directory exists
    if (!fs.existsSync(skillsDir)) {
      console.log(`Skills directory '${skillsDir}' not found. No skills will be loaded.`);
      return skills;
    }
    
    const entries = await fs.promises.readdir(skillsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const skillDir = path.join(skillsDir, entry.name);
      const skillMdPath = path.join(skillDir, 'SKILL.md');
      
      // Check if SKILL.md exists
      if (!fs.existsSync(skillMdPath)) {
        console.warn(`SKILL.md not found in ${skillDir}. Skipping.`);
        continue;
      }
      
      try {
        // Read and parse SKILL.md
        const skillMdContent = await fs.promises.readFile(skillMdPath, 'utf-8');
        const metadata = parseSkillMetadata(skillMdContent);
        
        // Load all files in the skill directory
        const files = await loadSkillFiles(skillDir);
        
        skills.push({
          name: metadata.name,
          description: metadata.description,
          files,
          directory: entry.name
        });
        
        console.log(`Loaded skill: ${metadata.name} (${files.length} files)`);
      } catch (error) {
        console.error(`Error loading skill from ${skillDir}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error scanning skills directory:`, error);
  }
  
  return skills;
}

/**
 * Convert skill files to the format expected by Anthropic Skills API
 */
export async function prepareSkillForUpload(skill: Skill): Promise<File[]> {
  const files: File[] = [];
  
  for (const file of skill.files) {
    // Determine MIME type based on file extension
    const ext = path.extname(file.name).toLowerCase();
    let mimeType = 'application/octet-stream';
    
    switch (ext) {
      case '.md':
        mimeType = 'text/markdown';
        break;
      case '.py':
        mimeType = 'text/x-python';
        break;
      case '.js':
        mimeType = 'text/javascript';
        break;
      case '.ts':
        mimeType = 'text/typescript';
        break;
      case '.json':
        mimeType = 'application/json';
        break;
      case '.txt':
        mimeType = 'text/plain';
        break;
      case '.yaml':
      case '.yml':
        mimeType = 'text/yaml';
        break;
    }
    
    // Convert Buffer to File using the toFile utility
    const fileObj = await toFile(file.content, file.path, { type: mimeType });
    files.push(fileObj);
  }
  
  return files;
}
