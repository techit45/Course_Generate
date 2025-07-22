# AI Setup Guide - OpenRouter Integration

## Overview

This project uses OpenRouter AI for generating study sheet content. OpenRouter provides access to multiple AI models including free options.

## Setup Instructions

### 1. Get OpenRouter API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for a free account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the API key (starts with `sk-or-v1-...`)

### 2. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your API key:
   ```env
   NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
   NEXT_PUBLIC_OPENROUTER_MODEL=anthropic/claude-3.5-haiku
   ```

### 3. Available Free Models

The following models are available for free on OpenRouter:

- `anthropic/claude-3.5-haiku` (Recommended)
- `meta-llama/llama-3.2-3b-instruct:free`
- `microsoft/phi-3-mini-128k-instruct:free`
- `huggingface/zephyr-7b-beta:free`
- `openchat/openchat-7b:free`
- `gryphe/mythomist-7b:free`

### 4. Rate Limits

Free tier limitations:
- 20 requests per minute
- 200 requests per hour
- 1000 requests per day

The application automatically handles rate limiting and will show warnings when limits are approached.

## Features

### AI Service Features

1. **Automatic Retry Logic**: Failed requests are automatically retried with exponential backoff
2. **Rate Limiting**: Built-in rate limiting to respect OpenRouter's limits
3. **Error Handling**: Comprehensive error handling with user-friendly messages
4. **Progress Tracking**: Real-time progress updates during content generation
5. **Content Validation**: Generated content is validated for completeness and quality

### Generated Content Structure

The AI generates comprehensive study sheets including:

- **Title**: Descriptive title for the lesson
- **Objectives**: Learning objectives (3-5 items)
- **Main Content**: Structured content sections with theory, examples, and explanations
- **Exercises**: Grade-appropriate exercises (5-20+ questions)
- **Activities**: Interactive learning activities with duration and materials
- **Summary**: Concise lesson summary
- **Images**: Suggestions for relevant images and diagrams

### Grade-Level Adaptation

The AI automatically adapts content for different grade levels (ม.1-6):

- **Vocabulary**: Age-appropriate terminology
- **Complexity**: Suitable cognitive difficulty
- **Examples**: Relevant real-world examples
- **Exercises**: Grade-appropriate problem difficulty

## Troubleshooting

### Common Issues

1. **"การตั้งค่า AI ไม่สมบูรณ์"**
   - Solution: Check that `NEXT_PUBLIC_OPENROUTER_API_KEY` is set in `.env.local`

2. **"ใช้งาน AI บ่อยเกินไป"**
   - Solution: Wait for the displayed time before making another request

3. **"ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ AI ได้"**
   - Solution: Check internet connection and OpenRouter service status

4. **"API Key ไม่ถูกต้อง"**
   - Solution: Verify the API key is correct and active on OpenRouter

### Development Tips

1. **Testing**: Use shorter topics and "น้อย" amounts for faster testing
2. **Debugging**: Check browser console for detailed error logs
3. **Model Selection**: Try different free models if one is unavailable
4. **Rate Limits**: Use development mode for reduced rate limiting

## Cost Optimization

1. **Use Free Models**: Stick to free models listed above
2. **Content Amount**: Use "น้อย" for development/testing
3. **Efficient Prompts**: The system uses optimized prompts to minimize token usage
4. **Caching**: Consider implementing response caching for repeated requests

## Security Notes

1. **API Key**: Never commit API keys to version control
2. **Client-Side**: API key is exposed in client-side code (acceptable for OpenRouter)
3. **Rate Limiting**: Built-in protection against excessive usage
4. **Content Validation**: All AI responses are validated before use

## Support

For AI-related issues:
1. Check this documentation
2. Review browser console logs
3. Test with different models
4. Contact OpenRouter support for API issues