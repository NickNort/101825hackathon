/**
 * Skill Loader
 *
 * Dynamically loads and combines all skills from the skills directory.
 */

import { Skill, CombinedSkillsConfig, SkillTool } from './types';

/**
 * Registry of all available skills
 * Import your skills here
 */
import { dataAnalysisSkill } from './data-analysis/skill';
import { webDevSkill } from './web-dev/skill';
import { generalAssistantSkill } from './general-assistant/skill';

// Add all skills to this array
const ALL_SKILLS: Skill[] = [
  generalAssistantSkill,
  dataAnalysisSkill,
  webDevSkill,
];

/**
 * Loads and combines all enabled skills
 *
 * @returns Combined configuration with system prompt and tools
 */
export function loadSkills(): CombinedSkillsConfig {
  // Filter to only enabled skills
  const enabledSkills = ALL_SKILLS.filter((skill) => skill.enabled);

  // Sort by priority (highest first)
  enabledSkills.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // Combine system prompts
  const systemPromptParts: string[] = [
    '# Claude Agent Capabilities',
    '',
    'You are a specialized AI assistant with the following skills and capabilities:',
    '',
  ];

  for (const skill of enabledSkills) {
    systemPromptParts.push(skill.systemPrompt);
    systemPromptParts.push(''); // Add blank line between skills
  }

  systemPromptParts.push('---');
  systemPromptParts.push('');
  systemPromptParts.push(
    'When responding to user requests, identify which skill(s) are most relevant and apply them appropriately. You may combine multiple skills to solve complex problems.'
  );

  const systemPrompt = systemPromptParts.join('\n');

  // Combine tools from all skills
  const toolsMap = new Map<string, SkillTool>();

  for (const skill of enabledSkills) {
    if (skill.tools) {
      for (const tool of skill.tools) {
        const toolKey = 'type' in tool ? tool.type : tool.name;
        // Avoid duplicates - first occurrence wins
        if (!toolsMap.has(toolKey)) {
          toolsMap.set(toolKey, tool);
        }
      }
    }
  }

  const tools = Array.from(toolsMap.values());

  return {
    systemPrompt,
    tools,
    enabledSkills,
  };
}

/**
 * Get a specific skill by ID
 */
export function getSkillById(id: string): Skill | undefined {
  return ALL_SKILLS.find((skill) => skill.id === id);
}

/**
 * Get all skills (enabled and disabled)
 */
export function getAllSkills(): Skill[] {
  return [...ALL_SKILLS];
}
