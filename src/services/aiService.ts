import axios, { AxiosResponse, AxiosError } from 'axios';
import { 
  AIRequest, 
  AIResponse, 
  StudySheetContent, 
  AIServiceError,
  GradeLevel,
  ContentAmount,
  ExerciseAmount
} from '@/types';
import { 
  openRouterConfig, 
  getEnvironmentConfig, 
  validateConfig,
  retryConfig,
  timeoutConfig 
} from '@/config/ai';
import { generatePrompt } from '@/config/prompts';
import { formatAIResponse, generateContentStructure } from '@/services/contentGenerator';
import { retryWithBackoff } from '@/utils/errorHandling';

// Custom AI Service Error class
class AIError extends Error implements AIServiceError {
  type: AIServiceError['type'];
  retryable: boolean;
  statusCode?: number;
  code?: string;

  constructor(
    message: string, 
    type: AIServiceError['type'], 
    retryable: boolean = false,
    statusCode?: number,
    code?: string
  ) {
    super(message);
    this.name = 'AIServiceError';
    this.type = type;
    this.retryable = retryable;
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Rate limiting utility
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number;

  constructor(maxRequests: number = 20, timeWindowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  getWaitTime(): number {
    if (this.canMakeRequest()) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    return this.timeWindow - (Date.now() - oldestRequest);
  }
}

// Initialize rate limiter
const rateLimiter = new RateLimiter(20, 60000); // 20 requests per minute

// AI Service class
export class AIService {
  private config = getEnvironmentConfig();
  private axiosInstance;

  constructor() {
    // Validate configuration on initialization
    if (!validateConfig()) {
      throw new AIError(
        'AI Service configuration is invalid. Please check your environment variables.',
        'invalid_request',
        false
      );
    }

    // Create axios instance with default configuration
    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: timeoutConfig.total,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://login-learning.com',
        'X-Title': 'Study Sheet Generator'
      }
    });

    // Add request interceptor for rate limiting
    this.axiosInstance.interceptors.request.use(async (config) => {
      if (!rateLimiter.canMakeRequest()) {
        const waitTime = rateLimiter.getWaitTime();
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      rateLimiter.recordRequest();
      return config;
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        throw this.handleAxiosError(error);
      }
    );
  }

  // Handle axios errors and convert to AI service errors
  private handleAxiosError(error: AxiosError): AIError {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new AIError(
        'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง',
        'timeout',
        true,
        0,
        'TIMEOUT'
      );
    }

    if (!error.response) {
      return new AIError(
        'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ AI ได้',
        'network',
        true,
        0,
        'NETWORK_ERROR'
      );
    }

    const { status, data } = error.response;

    switch (status) {
      case 401:
        return new AIError(
          'API Key ไม่ถูกต้อง กรุณาตรวจสอบการตั้งค่า',
          'invalid_request',
          false,
          401,
          'INVALID_API_KEY'
        );
      case 429:
        return new AIError(
          'ใช้งาน AI บ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่',
          'rate_limit',
          true,
          429,
          'RATE_LIMIT_EXCEEDED'
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return new AIError(
          'เซิร์ฟเวอร์ AI ขัดข้อง กรุณาลองใหม่ในภายหลัง',
          'server_error',
          true,
          status,
          'SERVER_ERROR'
        );
      default:
        return new AIError(
          (data as any)?.error?.message || 'เกิดข้อผิดพลาดจาก AI Service',
          'server_error',
          false,
          status,
          'UNKNOWN_ERROR'
        );
    }
  }

  // Validate JSON response from AI
  private validateAIResponse(response: string): StudySheetContent {
    try {
      const parsed = JSON.parse(response);
      
      // Basic validation
      if (!parsed.title || !parsed.objectives || !parsed.mainContent) {
        throw new Error('Response missing required fields');
      }

      // Ensure arrays exist
      parsed.objectives = Array.isArray(parsed.objectives) ? parsed.objectives : [];
      parsed.mainContent = Array.isArray(parsed.mainContent) ? parsed.mainContent : [];
      parsed.exercises = Array.isArray(parsed.exercises) ? parsed.exercises : [];
      parsed.activities = Array.isArray(parsed.activities) ? parsed.activities : [];
      parsed.images = Array.isArray(parsed.images) ? parsed.images : [];

      // Add default values if missing
      parsed.summary = parsed.summary || 'สรุปบทเรียน';

      return parsed as StudySheetContent;
    } catch (error) {
      throw new AIError(
        'ไม่สามารถประมวลผลข้อมูลจาก AI ได้ กรุณาลองใหม่อีกครั้ง',
        'server_error',
        true
      );
    }
  }

  // Make API call to OpenRouter
  private async makeAPICall(prompt: { system: string; user: string }, model?: string): Promise<string> {
    const requestData = {
      model: model || this.config.model,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user }
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      response_format: { type: 'json_object' } // Request JSON response
    };

    const response: AxiosResponse = await this.axiosInstance.post('/chat/completions', requestData);
    
    if (!response.data?.choices?.[0]?.message?.content) {
      throw new AIError(
        'ไม่ได้รับข้อมูลจาก AI กรุณาลองใหม่อีกครั้ง',
        'server_error',
        true
      );
    }

    return response.data.choices[0].message.content;
  }

  // Generate study sheet content
  async generateStudySheet(request: AIRequest, modelId?: string): Promise<AIResponse> {
    try {
      console.log('🤖 Starting AI content generation...', request);
      console.log('🎯 Using model:', modelId || this.config.model);

      // Generate content structure and specifications
      const contentStructure = generateContentStructure(request);
      console.log('📋 Generated content structure:', {
        specs: contentStructure.specs,
        template: contentStructure.template.name,
        sessionDuration: contentStructure.teachingSession.duration
      });

      // Generate enhanced prompt with structure information
      const prompt = generatePrompt(
        request.topic,
        request.gradeLevel,
        request.contentAmount,
        request.exerciseAmount
      );

      // Add structure information to the prompt
      const enhancedPrompt = {
        ...prompt,
        user: prompt.user + `\n\nข้อมูลโครงสร้างเพิ่มเติม:
- จำนวนหน้า: ${contentStructure.specs.pageRange[0]}-${contentStructure.specs.pageRange[1]} หน้า
- จำนวนหัวข้อหลัก: ${contentStructure.specs.sectionCount[0]}-${contentStructure.specs.sectionCount[1]} หัวข้อ
- จำนวนแบบฝึกหัด: ${contentStructure.specs.exerciseCount[0]}-${contentStructure.specs.exerciseCount[1]} ข้อ
- จำนวนกิจกรรม: ${contentStructure.specs.activityCount[0]}-${contentStructure.specs.activityCount[1]} กิจกรรม
- การแบ่งเวลา: บทนำ ${contentStructure.timeAllocation.introduction} นาที, เนื้อหาหลัก ${contentStructure.timeAllocation.mainContent} นาที, กิจกรรม ${contentStructure.timeAllocation.activities} นาที
- สัดส่วนความยาก: ง่าย ${contentStructure.specs.difficultyDistribution.easy}%, ปานกลาง ${contentStructure.specs.difficultyDistribution.medium}%, ยาก ${contentStructure.specs.difficultyDistribution.hard}%

แผนการสอน 4 ชั่วโมง:
${contentStructure.teachingSession.phases.map(phase => 
  `- ${phase.name} (${phase.duration} นาที): ${phase.content.join(', ')}`
).join('\n')}`
      };

      console.log('📝 Generated enhanced prompt for AI with structure');

      // Make API call with retry logic
      const aiResponse = await retryWithBackoff(
        () => this.makeAPICall(enhancedPrompt, modelId),
        retryConfig.attempts,
        retryConfig.baseDelay
      );

      console.log('✅ Received AI response');

      // Validate and parse response
      const rawContent = this.validateAIResponse(aiResponse);
      
      // Format and enhance the AI response with content generator
      const formattedContent = await formatAIResponse(rawContent, request);

      console.log('🎯 Successfully formatted and validated AI response');

      return {
        success: true,
        data: formattedContent,
        usage: {
          promptTokens: estimateTokens(enhancedPrompt.system + enhancedPrompt.user),
          completionTokens: estimateTokens(aiResponse),
          totalTokens: estimateTokens(enhancedPrompt.system + enhancedPrompt.user + aiResponse)
        }
      };

    } catch (error) {
      console.error('❌ AI Service Error:', error);

      if (error instanceof AIError) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: false,
        error: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง'
      };
    }
  }

  // Check service health
  async healthCheck(): Promise<boolean> {
    try {
      const testRequest: AIRequest = {
        topic: 'การทดสอบระบบ',
        gradeLevel: 'ม.1' as GradeLevel,
        contentAmount: 'น้อย' as ContentAmount,
        exerciseAmount: 'น้อย' as ExerciseAmount
      };

      const response = await this.generateStudySheet(testRequest);
      return response.success;
    } catch {
      return false;
    }
  }

  // Get service status
  getServiceStatus() {
    return {
      configured: validateConfig(),
      model: this.config.model,
      rateLimitAvailable: rateLimiter.canMakeRequest(),
      waitTime: rateLimiter.getWaitTime()
    };
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export helper functions
export const createAIRequest = (
  topic: string,
  gradeLevel: GradeLevel,
  contentAmount: ContentAmount,
  exerciseAmount: ExerciseAmount
): AIRequest => ({
  topic,
  gradeLevel,
  contentAmount,
  exerciseAmount
});

// Type guard for AI errors
export const isAIServiceError = (error: any): error is AIServiceError => {
  return error instanceof AIError;
};

// Token estimation utility
const estimateTokens = (text: string): number => {
  // Rough estimation: 1 token ≈ 4 characters for Thai/English mixed text
  return Math.ceil(text.length / 4);
};