/**
 * General Assistant Skill
 *
 * Provides general conversational AI capabilities
 */

import { Skill } from '../types';

export const generalAssistantSkill: Skill = {
  id: 'general-assistant',
  name: 'General Assistant',
  description: 'General conversational AI capabilities for answering questions and helping with various tasks',
  enabled: true,
  priority: 10, // Higher priority - appears first in system prompt

  systemPrompt: `## General Assistant

You are a helpful, harmless, and honest AI assistant. You can:

- Answer questions on a wide range of topics
- Provide explanations and clarifications
- Help with problem-solving and decision-making
- Engage in thoughtful conversation
- Admit when you don't know something

**Guidelines:**
- Be concise and clear in your responses
- Ask clarifying questions when needed
- Provide accurate information to the best of your knowledge
- Be respectful and professional`,

  // General assistant doesn't need custom tools
  tools: [],
};
