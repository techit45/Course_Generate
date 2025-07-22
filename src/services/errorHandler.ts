// Comprehensive Error Handling System for GenCouce
import { logger } from './logger';

export interface ErrorInfo {
  code: string;
  message: string;
  userMessage: string;
  solution: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'ai' | 'validation' | 'export' | 'system' | 'user';
  retryable: boolean;
  reportable: boolean;
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  component: string;
  action: string;
  timestamp: Date;
  additionalData?: Record<string, any>;
}

// Comprehensive error mapping with user-friendly messages
export const ERROR_CATALOG: Record<string, ErrorInfo> = {
  // Network Errors
  'NETWORK_TIMEOUT': {
    code: 'NETWORK_TIMEOUT',
    message: 'Request timeout',
    userMessage: 'การเชื่อมต่อหมดเวลา กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
    solution: 'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต และลองใหม่อีกครั้ง',
    severity: 'medium',
    category: 'network',
    retryable: true,
    reportable: false
  },
  
  'NETWORK_ERROR': {
    code: 'NETWORK_ERROR',
    message: 'Network connection failed',
    userMessage: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
    solution: 'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองใหม่',
    severity: 'high',
    category: 'network',
    retryable: true,
    reportable: true
  },

  'SERVER_UNAVAILABLE': {
    code: 'SERVER_UNAVAILABLE',
    message: 'Server is temporarily unavailable',
    userMessage: 'เซิร์ฟเวอร์ไม่สามารถใช้งานได้ชั่วคราว',
    solution: 'กรุณารอสักครู่แล้วลองใหม่ หรือติดต่อทีมสนับสนุน',
    severity: 'high',
    category: 'network',
    retryable: true,
    reportable: true
  },

  // AI Service Errors
  'AI_API_KEY_INVALID': {
    code: 'AI_API_KEY_INVALID',
    message: 'Invalid API key',
    userMessage: 'การตั้งค่า AI ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ',
    solution: 'ติดต่อผู้ดูแลระบบเพื่อตรวจสอบการตั้งค่า API',
    severity: 'critical',
    category: 'ai',
    retryable: false,
    reportable: true
  },

  'AI_RATE_LIMIT': {
    code: 'AI_RATE_LIMIT',
    message: 'AI service rate limit exceeded',
    userMessage: 'ใช้งาน AI บ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่',
    solution: 'รอ 1-2 นาทีแล้วลองสร้างชีทเรียนใหม่',
    severity: 'medium',
    category: 'ai',
    retryable: true,
    reportable: false
  },

  'AI_CONTENT_GENERATION_FAILED': {
    code: 'AI_CONTENT_GENERATION_FAILED',
    message: 'AI failed to generate content',
    userMessage: 'ไม่สามารถสร้างเนื้อหาด้วย AI ได้ กรุณาลองใหม่หรือใช้โหมดสำรอง',
    solution: 'ลองใหม่อีกครั้ง หรือใช้โหมดสำรองการสร้างเนื้อหา',
    severity: 'high',
    category: 'ai',
    retryable: true,
    reportable: true
  },

  'AI_RESPONSE_INVALID': {
    code: 'AI_RESPONSE_INVALID',
    message: 'AI response format is invalid',
    userMessage: 'ข้อมูลจาก AI ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
    solution: 'ลองเปลี่ยนโมเดล AI หรือปรับคำสั่งให้ชัดเจนยิ่งขึ้น',
    severity: 'medium',
    category: 'ai',
    retryable: true,
    reportable: true
  },

  'AI_MODEL_UNAVAILABLE': {
    code: 'AI_MODEL_UNAVAILABLE',
    message: 'Selected AI model is not available',
    userMessage: 'โมเดล AI ที่เลือกไม่สามารถใช้งานได้ กรุณาเลือกโมเดลอื่น',
    solution: 'เลือกโมเดล AI อื่นที่มีให้บริการ',
    severity: 'medium',
    category: 'ai',
    retryable: true,
    reportable: false
  },

  // Validation Errors
  'VALIDATION_TOPIC_EMPTY': {
    code: 'VALIDATION_TOPIC_EMPTY',
    message: 'Topic is required',
    userMessage: 'กรุณากรอกหัวข้อการเรียน',
    solution: 'กรอกหัวข้อที่ต้องการสร้างชีทเรียน',
    severity: 'low',
    category: 'validation',
    retryable: true,
    reportable: false
  },

  'VALIDATION_TOPIC_INAPPROPRIATE': {
    code: 'VALIDATION_TOPIC_INAPPROPRIATE',
    message: 'Topic content is inappropriate',
    userMessage: 'หัวข้อที่กรอกไม่เหมาะสม กรุณาใช้หัวข้อที่เกี่ยวข้องกับการศึกษา',
    solution: 'กรอกหัวข้อที่เกี่ยวข้องกับการศึกษาและเหมาะสม',
    severity: 'medium',
    category: 'validation',
    retryable: true,
    reportable: false
  },

  'VALIDATION_TOPIC_TOO_LONG': {
    code: 'VALIDATION_TOPIC_TOO_LONG',
    message: 'Topic is too long',
    userMessage: 'หัวข้อยาวเกินไป กรุณากรอกไม่เกิน 100 ตัวอักษร',
    solution: 'ย่อหัวข้อให้สั้นลงและกระชับมากขึ้น',
    severity: 'low',
    category: 'validation',
    retryable: true,
    reportable: false
  },

  // Export Errors
  'EXPORT_PDF_FAILED': {
    code: 'EXPORT_PDF_FAILED',
    message: 'PDF export failed',
    userMessage: 'ไม่สามารถสร้างไฟล์ PDF ได้ กรุณาลองใหม่อีกครั้ง',
    solution: 'ลองลดคุณภาพไฟล์หรือเปลี่ยนขนาดหน้ากระดาษ',
    severity: 'medium',
    category: 'export',
    retryable: true,
    reportable: true
  },

  'EXPORT_CONTENT_TOO_LARGE': {
    code: 'EXPORT_CONTENT_TOO_LARGE',
    message: 'Content is too large for export',
    userMessage: 'เนื้อหามีขนาดใหญ่เกินไปสำหรับการส่งออก',
    solution: 'ลองลดปริมาณเนื้อหาหรือแบ่งออกเป็นหลายไฟล์',
    severity: 'medium',
    category: 'export',
    retryable: true,
    reportable: false
  },

  'EXPORT_BROWSER_NOT_SUPPORTED': {
    code: 'EXPORT_BROWSER_NOT_SUPPORTED',
    message: 'Browser does not support export feature',
    userMessage: 'เบราว์เซอร์นี้ไม่รองรับการส่งออก กรุณาใช้เบราว์เซอร์ที่ทันสมัยกว่า',
    solution: 'อัปเดตเบราว์เซอร์หรือใช้ Chrome, Firefox, Safari รุ่นใหม่',
    severity: 'medium',
    category: 'export',
    retryable: false,
    reportable: false
  },

  // System Errors
  'MEMORY_ERROR': {
    code: 'MEMORY_ERROR',
    message: 'Insufficient memory',
    userMessage: 'หน่วยความจำไม่เพียงพอ กรุณาปิดแท็บอื่นๆ แล้วลองใหม่',
    solution: 'ปิดแท็บที่ไม่ใช้งานและรีเฟรชหน้าเว็บ',
    severity: 'high',
    category: 'system',
    retryable: true,
    reportable: true
  },

  'STORAGE_FULL': {
    code: 'STORAGE_FULL',
    message: 'Browser storage is full',
    userMessage: 'พื้นที่เก็บข้อมูลเต็ม กรุณาล้างข้อมูลเบราว์เซอร์',
    solution: 'ล้างแคช cookies และข้อมูลเว็บไซต์',
    severity: 'medium',
    category: 'system',
    retryable: true,
    reportable: false
  },

  // User Errors
  'USER_SESSION_EXPIRED': {
    code: 'USER_SESSION_EXPIRED',
    message: 'User session has expired',
    userMessage: 'เซสชันหมดอายุ กรุณารีเฟรชหน้าเว็บ',
    solution: 'รีเฟรชหน้าเว็บหรือเริ่มต้นใหม่',
    severity: 'low',
    category: 'user',
    retryable: true,
    reportable: false
  },

  // Generic Errors
  'UNKNOWN_ERROR': {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    userMessage: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่หรือติดต่อทีมสนับสนุน',
    solution: 'รีเฟรชหน้าเว็บ หรือติดต่อทีมสนับสนุนหากปัญหายังคงเกิดขึ้น',
    severity: 'medium',
    category: 'system',
    retryable: true,
    reportable: true
  }
};

// Error handling utility class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private loggers: Array<(error: any, context: ErrorContext) => void> = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Add logger (console, external service, etc.)
  addLogger(logger: (error: any, context: ErrorContext) => void) {
    this.loggers.push(logger);
  }

  // Process and handle any error
  handleError(
    error: any, 
    context: ErrorContext,
    customErrorInfo?: Partial<ErrorInfo>
  ): ErrorInfo {
    const errorInfo = this.getErrorInfo(error, customErrorInfo);
    
    // Log the error
    this.logError(error, context, errorInfo);

    // Report if needed
    if (errorInfo.reportable && errorInfo.severity !== 'low') {
      this.reportError(error, context, errorInfo);
    }

    return errorInfo;
  }

  // Get user-friendly error information
  private getErrorInfo(error: any, customInfo?: Partial<ErrorInfo>): ErrorInfo {
    let errorCode = 'UNKNOWN_ERROR';

    // Try to identify error type
    if (error?.code) {
      errorCode = error.code;
    } else if (error?.message) {
      errorCode = this.identifyErrorFromMessage(error.message);
    } else if (error?.status || error?.statusCode) {
      errorCode = this.identifyErrorFromStatus(error.status || error.statusCode);
    }

    const baseError = ERROR_CATALOG[errorCode] || ERROR_CATALOG['UNKNOWN_ERROR'];
    
    // Merge with custom information
    return {
      ...baseError,
      ...customInfo
    };
  }

  // Identify error from message patterns
  private identifyErrorFromMessage(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('timeout')) return 'NETWORK_TIMEOUT';
    if (lowerMessage.includes('network')) return 'NETWORK_ERROR';
    if (lowerMessage.includes('api key')) return 'AI_API_KEY_INVALID';
    if (lowerMessage.includes('rate limit')) return 'AI_RATE_LIMIT';
    if (lowerMessage.includes('memory')) return 'MEMORY_ERROR';
    if (lowerMessage.includes('storage')) return 'STORAGE_FULL';
    if (lowerMessage.includes('pdf')) return 'EXPORT_PDF_FAILED';
    if (lowerMessage.includes('too large')) return 'EXPORT_CONTENT_TOO_LARGE';
    
    return 'UNKNOWN_ERROR';
  }

  // Identify error from HTTP status codes
  private identifyErrorFromStatus(status: number): string {
    switch (status) {
      case 401: return 'AI_API_KEY_INVALID';
      case 429: return 'AI_RATE_LIMIT';
      case 500:
      case 502:
      case 503:
      case 504: return 'SERVER_UNAVAILABLE';
      default: return 'NETWORK_ERROR';
    }
  }

  // Log error with all available loggers
  private logError(error: any, context: ErrorContext, errorInfo: ErrorInfo) {
    const logData = {
      error,
      context,
      errorInfo,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
    };

    // Use all registered loggers
    this.loggers.forEach(logger => {
      try {
        logger(logData, context);
      } catch (loggerError) {
        console.error('Logger failed:', loggerError);
      }
    });

    // Always log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${errorInfo.severity.toUpperCase()} ERROR: ${errorInfo.code}`);
      console.error('Original Error:', error);
      console.log('Context:', context);
      console.log('Error Info:', errorInfo);
      console.log('Full Log Data:', logData);
      console.groupEnd();
    }
  }

  // Report critical errors to monitoring service
  private reportError(error: any, context: ErrorContext, errorInfo: ErrorInfo) {
    // In a real implementation, this would send to error monitoring service
    // like Sentry, Bugsnag, or custom endpoint
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to monitoring service
      // this.sendToMonitoringService({ error, context, errorInfo });
    }
  }

  // Get retry delay based on error type and attempt count
  getRetryDelay(errorCode: string, attemptCount: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    
    // Exponential backoff with jitter
    const exponentialDelay = Math.min(
      baseDelay * Math.pow(2, attemptCount - 1),
      maxDelay
    );
    
    // Add jitter (±20%)
    const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);
    
    return Math.max(1000, exponentialDelay + jitter);
  }

  // Check if error should trigger automatic retry
  shouldRetry(errorInfo: ErrorInfo, attemptCount: number): boolean {
    const maxRetries = errorInfo.severity === 'critical' ? 1 : 3;
    return errorInfo.retryable && attemptCount < maxRetries;
  }

  // Format error for user display
  formatUserMessage(errorInfo: ErrorInfo, additionalContext?: string): string {
    let message = errorInfo.userMessage;
    
    if (additionalContext) {
      message += `\n\nรายละเอียดเพิ่มเติม: ${additionalContext}`;
    }
    
    if (errorInfo.solution) {
      message += `\n\n💡 วิธีแก้ไข: ${errorInfo.solution}`;
    }
    
    return message;
  }
}

// Retry utility with exponential backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
  context: ErrorContext
): Promise<T> {
  const errorHandler = ErrorHandler.getInstance();
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const errorInfo = errorHandler.handleError(error, {
        ...context,
        additionalData: { attempt, maxAttempts }
      });

      if (attempt === maxAttempts || !errorHandler.shouldRetry(errorInfo, attempt)) {
        throw error;
      }

      const delay = errorHandler.getRetryDelay(errorInfo.code, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Default console logger
export const consoleLogger = (logData: any, context: ErrorContext) => {
  const { errorInfo } = logData;
  
  if (errorInfo.severity === 'critical' || errorInfo.severity === 'high') {
    console.error(`[${context.component}] ${errorInfo.code}: ${errorInfo.message}`);
  } else if (errorInfo.severity === 'medium') {
    console.warn(`[${context.component}] ${errorInfo.code}: ${errorInfo.message}`);
  } else {
    console.info(`[${context.component}] ${errorInfo.code}: ${errorInfo.message}`);
  }
};

// Enhanced logger using the comprehensive logging service

const enhancedLogger = (logData: any, context: ErrorContext) => {
  const { error, errorInfo } = logData;
  
  logger.error(
    context.component,
    `${errorInfo.code}: ${errorInfo.message}`,
    {
      errorInfo,
      context,
      originalError: error,
      userMessage: errorInfo.userMessage,
      solution: errorInfo.solution,
      retryable: errorInfo.retryable,
      reportable: errorInfo.reportable
    },
    error instanceof Error ? error : new Error(String(error))
  );
};

// Initialize error handler with both console and enhanced loggers
const errorHandler = ErrorHandler.getInstance();
errorHandler.addLogger(consoleLogger);
errorHandler.addLogger(enhancedLogger);

export { errorHandler };