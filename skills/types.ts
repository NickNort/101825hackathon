/**
 * Skill System Type Definitions
 *
 * This file defines the types used by the modular skill system.
 */

/**
 * Tool definition for Anthropic API
 * Can be either code_execution or custom function tools
 */
export type SkillTool =
  | {
      type: 'code_execution_20250825';
      name: 'code_execution';
    }
  | {
      name: string;
      description: string;
      input_schema: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
      };
    };

/**
 * Individual skill configuration
 */
export interface Skill {
  /**
   * Unique identifier for the skill
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Brief description of what the skill does
   */
  description: string;

  /**
   * Whether this skill is enabled (allows toggling skills on/off)
   */
  enabled: boolean;

  /**
   * System prompt fragment that will be combined with other skills
   * This should describe the skill's capabilities and when to use it
   */
  systemPrompt: string;

  /**
   * Optional tools that this skill provides
   * If not specified, skill only contributes to system prompt
   */
  tools?: SkillTool[];

  /**
   * Optional: Priority for ordering in system prompt (higher = earlier)
   * Default: 0
   */
  priority?: number;
}

/**
 * Combined configuration from all skills
 */
export interface CombinedSkillsConfig {
  /**
   * Combined system prompt from all enabled skills
   */
  systemPrompt: string;

  /**
   * Combined tools from all enabled skills
   */
  tools: SkillTool[];

  /**
   * List of enabled skills
   */
  enabledSkills: Skill[];
}
