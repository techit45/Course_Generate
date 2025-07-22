import { OpenRouterConfig } from '@/types';

// OpenRouter AI Configuration
export const openRouterConfig: OpenRouterConfig = {
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
  baseUrl: 'https://openrouter.ai/api/v1',
  model: process.env.NEXT_PUBLIC_OPENROUTER_MODEL || 'deepseek/deepseek-chat',
  maxTokens: 6000, // Increased for Kimi model capabilities
  temperature: 0.7,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000 // 1 second base delay
};

// Available models on OpenRouter (as of 2024)
export const availableModels = [
  'deepseek/deepseek-chat', // DeepSeek (Kimi) model - Primary choice
  'deepseek/deepseek-coder', // DeepSeek Coder variant
  'anthropic/claude-3.5-haiku',
  'anthropic/claude-3-haiku',
  'meta-llama/llama-3.2-3b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free',
  'huggingface/zephyr-7b-beta:free',
  'openchat/openchat-7b:free',
  'gryphe/mythomist-7b:free',
  'undi95/toppy-m-7b:free'
];

// Rate limiting configuration
export const rateLimits = {
  requestsPerMinute: 20,
  requestsPerHour: 200,
  requestsPerDay: 1000
};

// Request timeout configurations
export const timeoutConfig = {
  connection: 10000, // 10 seconds
  response: 30000,   // 30 seconds
  total: 45000       // 45 seconds total
};

// Retry configuration
export const retryConfig = {
  attempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: [
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN'
  ],
  retryableStatusCodes: [429, 500, 502, 503, 504]
};

// Validate configuration
export const validateConfig = (): boolean => {
  if (!openRouterConfig.apiKey) {
    console.warn('OpenRouter API key not found. Please set NEXT_PUBLIC_OPENROUTER_API_KEY environment variable.');
    return false;
  }
  
  if (!availableModels.includes(openRouterConfig.model)) {
    console.warn(`Model ${openRouterConfig.model} not in available models list. Available models: ${availableModels.join(', ')}`);
  }
  
  return true;
};

// Get environment-specific settings
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    ...openRouterConfig,
    timeout: isDevelopment ? 60000 : openRouterConfig.timeout, // Longer timeout in dev
    retryAttempts: isDevelopment ? 1 : openRouterConfig.retryAttempts, // Fewer retries in dev
    logLevel: isDevelopment ? 'debug' : 'info'
  };
};