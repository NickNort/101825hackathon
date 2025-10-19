# Modular Skills System

This directory contains the modular skills system for the Claude agent. Skills are individual modules that provide specialized capabilities, knowledge, and tools to the agent.

## Overview

The skills system allows you to:
- **Add new capabilities** without modifying core API code
- **Enable/disable skills** individually
- **Combine multiple skills** for complex use cases
- **Organize agent knowledge** into logical modules
- **Share and reuse** skill configurations

## Architecture

```
skills/
├── README.md              # This file
├── types.ts               # TypeScript type definitions
├── loader.ts              # Skill loader that combines all skills
├── general-assistant/     # Example: General conversational AI
│   └── skill.ts
├── data-analysis/         # Example: Python data analysis
│   └── skill.ts
└── web-dev/               # Example: Web development expertise
    └── skill.ts
```

## How It Works

1. **Individual Skills** - Each skill is defined in its own directory with a `skill.ts` file
2. **Skill Loader** - The `loader.ts` combines all enabled skills into a single configuration
3. **API Integration** - The API route (`app/api/chat/route.ts`) uses the combined configuration
4. **Runtime Combination** - System prompts and tools are merged when the server starts

## Creating a New Skill

### Step 1: Create the Skill Directory

Create a new directory under `skills/`:

```bash
mkdir skills/your-skill-name
```

### Step 2: Create the Skill Configuration

Create `skills/your-skill-name/skill.ts`:

```typescript
import { Skill } from '../types';

export const yourSkillNameSkill: Skill = {
  // Unique identifier (use kebab-case)
  id: 'your-skill-name',

  // Human-readable name
  name: 'Your Skill Name',

  // Brief description
  description: 'What this skill does and when to use it',

  // Enable/disable this skill
  enabled: true,

  // Priority (higher = appears earlier in system prompt)
  // Range: 0-10, where 10 is highest
  priority: 5,

  // System prompt describing the skill's capabilities
  systemPrompt: `## Your Skill Name

Describe what the agent can do with this skill:

- **Capability 1**: Description
- **Capability 2**: Description

**Best Practices:**
- Guideline 1
- Guideline 2`,

  // Optional: Custom tools for this skill
  tools: [],
};
```

### Step 3: Register the Skill

Add your skill to `skills/loader.ts`:

```typescript
// 1. Import your skill
import { yourSkillNameSkill } from './your-skill-name/skill';

// 2. Add to ALL_SKILLS array
const ALL_SKILLS: Skill[] = [
  generalAssistantSkill,
  dataAnalysisSkill,
  webDevSkill,
  yourSkillNameSkill, // <-- Add here
];
```

### Step 4: Restart the Server

The skill will be loaded automatically on the next server start:

```bash
npm run dev
```

## Skill Configuration Reference

### Required Properties

- **`id`** (string) - Unique identifier for the skill (kebab-case)
- **`name`** (string) - Human-readable name
- **`description`** (string) - Brief description of the skill
- **`enabled`** (boolean) - Whether this skill is active
- **`systemPrompt`** (string) - Markdown text describing capabilities

### Optional Properties

- **`priority`** (number) - Order in system prompt (0-10, default: 0)
  - Higher priority skills appear first
  - Use 10 for core/foundational skills
  - Use 5 for specialized skills
  - Use 0 for optional/experimental skills

- **`tools`** (SkillTool[]) - Custom tools for this skill
  - Code execution tool
  - Custom function calling tools

## Adding Tools to a Skill

### Code Execution Tool

For skills that need Python code execution:

```typescript
tools: [
  {
    type: 'code_execution_20250825',
    name: 'code_execution',
  },
],
```

### Custom Function Tool

For custom tool calling:

```typescript
tools: [
  {
    name: 'search_database',
    description: 'Search the product database',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query',
        },
        limit: {
          type: 'number',
          description: 'Max results to return',
        },
      },
      required: ['query'],
    },
  },
],
```

**Note**: Custom tools require additional implementation in the API route to handle tool execution.

## Best Practices

### Writing System Prompts

1. **Be Specific**: Clearly describe what the skill can and cannot do
2. **Use Markdown**: Structure with headers, lists, and formatting
3. **Include Examples**: Show how to use the skill when helpful
4. **Set Expectations**: Explain limitations and best practices
5. **Be Concise**: Keep prompts focused - aim for 200-500 words

### Organizing Skills

1. **One Responsibility**: Each skill should have a clear, focused purpose
2. **Avoid Overlap**: Don't duplicate capabilities across skills
3. **Composable**: Skills should work well together
4. **Self-Contained**: Each skill should be independent

### Naming Conventions

- **Directory**: `kebab-case` (e.g., `data-analysis`)
- **File**: `skill.ts`
- **Export**: `camelCaseSkill` (e.g., `dataAnalysisSkill`)
- **ID**: Same as directory name (e.g., `'data-analysis'`)

## Example: Simple Skill

Here's a minimal skill without tools:

```typescript
import { Skill } from '../types';

export const mathHelperSkill: Skill = {
  id: 'math-helper',
  name: 'Math Helper',
  description: 'Solve math problems and explain mathematical concepts',
  enabled: true,
  priority: 6,

  systemPrompt: `## Math Helper

You can help users with:
- Solving equations and mathematical problems
- Explaining mathematical concepts
- Step-by-step problem solving
- Math notation and terminology

Always show your work and explain your reasoning.`,

  tools: [],
};
```

## Example: Advanced Skill with Tools

Here's a skill that uses code execution:

```typescript
import { Skill } from '../types';

export const imageProcessingSkill: Skill = {
  id: 'image-processing',
  name: 'Image Processing',
  description: 'Process and analyze images using Python',
  enabled: true,
  priority: 7,

  systemPrompt: `## Image Processing

You can process images using Python libraries:

**Available Libraries:**
- PIL/Pillow: Image manipulation
- opencv-python: Computer vision
- numpy: Numerical operations

**Capabilities:**
- Resize, crop, rotate images
- Apply filters and effects
- Extract image metadata
- Basic computer vision tasks`,

  tools: [
    {
      type: 'code_execution_20250825',
      name: 'code_execution',
    },
  ],
};
```

## Troubleshooting

### Skill Not Loading

1. Check that the skill is imported in `loader.ts`
2. Verify it's added to the `ALL_SKILLS` array
3. Ensure `enabled: true` is set
4. Restart the development server

### Skill Not Working as Expected

1. Review the system prompt for clarity
2. Check if tools are correctly configured
3. Verify there are no TypeScript errors
4. Test with simple queries first

### TypeScript Errors

Make sure your skill file imports from the correct path:

```typescript
import { Skill } from '../types';  // Relative to skills/your-skill/
```

## Advanced Topics

### Dynamic Skill Loading

Currently, skills are loaded at server startup. For dynamic loading at runtime, you could:

1. Store skills in a database
2. Create an admin API to enable/disable skills
3. Reload skills without server restart

### Skill Dependencies

If a skill depends on another skill, set priorities appropriately:

```typescript
// Foundation skill - highest priority
export const baseSkill: Skill = { priority: 10, ... };

// Dependent skill - lower priority
export const advancedSkill: Skill = { priority: 5, ... };
```

### Environment-Specific Skills

Enable skills conditionally based on environment:

```typescript
export const debugSkill: Skill = {
  id: 'debug',
  enabled: process.env.NODE_ENV === 'development',
  ...
};
```

## Contributing

When creating skills for this project:

1. Follow the naming conventions
2. Write clear, concise system prompts
3. Test your skill thoroughly
4. Document any special requirements
5. Update this README if adding new patterns

## License

Skills follow the same license as the main project.
