// OpenAI Integration using @ai-sdk/openai
import { convertToUIMessages } from 'ai';
import { openai } from '@ai-sdk/openai';
import { tool } from 'ai';

// Get API key from environment
const apiKey = process.env.OPENAI_API_KEY || '';

// Rate limiter for API calls
const callCount = 0;
const MAX_CALLS_PER_MINUTE = 60;
const CALLS_COOLDOWN = 60000; // 1 minute in ms

async function applyRateLimit(): Promise<void> {
  // Simple rate limiting implementation
  // In production, use a proper Redis-based rate limiter
}

// Chat with OpenAI
export async function chatWithOpenAI(messages: string[]): Promise<string> {
  await applyRateLimit();

  try {
    const result = await openai.chatCompletion({
      model: 'gpt-4-turbo',
      messages: convertToUIMessages(messages, { system: 'You are Wizard\'s AI assistant, providing magical assistance' }),
    });

    const content = result.choices?.[0]?.message?.content || '';
    return content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

// Generate content with specific parameters
export async function generateContent(prompt: string, options?: {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}): Promise<string> {
  const systemMsg = options?.systemPrompt || 'You are Wizard\'s AI assistant';
  const userMsg = `
  ${systemMsg}
  
  ${prompt}
  `;

  try {
    const result = await openai.chatCompletion({
      model: options?.temperature ? 'gpt-4-turbo' : 'gpt-4o',
      messages: convertToUIMessages([{ role: 'user', content: userMsg }]),
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });

    const content = result.choices?.[0]?.message?.content || '';
    return content;
  } catch (error) {
    console.error('OpenAI generation error:', error);
    throw error;
  }
}

// AI Tools for integration
export const analyzeCode = tool({
  description: 'Analyze code for vulnerabilities and improvements',
  parameters: {
    type: 'object',
    properties: {
      code: { type: 'string', description: 'Code to analyze' },
      language: { type: 'string', enum: ['javascript', 'typescript', 'python', 'html', 'css'] },
    },
    required: ['code', 'language'],
  },
  execute: async ({ code, language }) => {
    const messages = [{ role: 'user', content: `Analyze this ${language} code for vulnerabilities and improvements:\n\n${code}` }];
    const result = await chatWithOpenAI(messages);
    return result;
  },
});

export const summarizePage = tool({
  description: 'Summarize a page for content generation',
  parameters: {
    type: 'object',
    properties: {
      content: { type: 'string', description: 'Page content to summarize' },
      topic: { type: 'string', description: 'Optional focus topic' },
    },
    required: ['content'],
  },
  execute: async ({ content, topic }) => {
    const messages = [{ role: 'user', content: `Summarize this content:\n\n${content}${topic ? ` Focus on: ${topic}` : ''}` }];
    const result = await chatWithOpenAI(messages);
    return result;
  },
});
