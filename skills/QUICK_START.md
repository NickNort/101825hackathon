# Quick Start: Adding a New Skill

Follow these steps to add a new skill in under 5 minutes.

## 1. Create Skill File

Create `skills/my-skill/skill.ts`:

```typescript
import { Skill } from '../types';

export const mySkillSkill: Skill = {
  id: 'my-skill',
  name: 'My Skill',
  description: 'Brief description of what this skill does',
  enabled: true,
  priority: 5,

  systemPrompt: `## My Skill

Describe the skill's capabilities here.

**What you can do:**
- Feature 1
- Feature 2
- Feature 3`,

  tools: [], // Add tools if needed
};
```

## 2. Register the Skill

Edit `skills/loader.ts`:

```typescript
// Add import at top
import { mySkillSkill } from './my-skill/skill';

// Add to ALL_SKILLS array
const ALL_SKILLS: Skill[] = [
  generalAssistantSkill,
  dataAnalysisSkill,
  webDevSkill,
  mySkillSkill, // <-- Add your skill here
];
```

## 3. Restart Server

```bash
npm run dev
```

## 4. Test

Send a message to your agent that would use the new skill!

## Common Patterns

### Skill with Code Execution

```typescript
tools: [
  {
    type: 'code_execution_20250825',
    name: 'code_execution',
  },
],
```

### Skill Without Tools (Knowledge Only)

```typescript
tools: [], // Just provide knowledge via systemPrompt
```

### High Priority Core Skill

```typescript
priority: 10, // Appears first in system prompt
```

### Optional/Experimental Skill

```typescript
enabled: false, // Disabled by default
priority: 0,    // Low priority
```

## Troubleshooting

**Build error?**
- Check that you imported the skill in `loader.ts`
- Verify the import path is correct: `'./my-skill/skill'`

**Skill not working?**
- Make sure `enabled: true`
- Restart the dev server
- Check the system prompt is clear and specific

**TypeScript error?**
- Import types: `import { Skill } from '../types';`
- Ensure the file exports a variable ending in `Skill`

## Examples

See the existing skills for examples:
- `skills/general-assistant/skill.ts` - Basic knowledge skill
- `skills/data-analysis/skill.ts` - Skill with code execution
- `skills/web-dev/skill.ts` - Complex knowledge skill

For more details, see [README.md](./README.md).
