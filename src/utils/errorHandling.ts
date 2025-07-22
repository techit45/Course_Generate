import { AppError, FormError, ApiResponse } from '@/types';

// Custom error classes
export class ValidationError extends Error implements AppError {
  code = 'VALIDATION_ERROR';
  statusCode = 400;
  
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error implements AppError {
  code = 'NETWORK_ERROR';
  statusCode = 0;
  
  constructor(message: string = 'เกิดข้อผิดพลาดในการเชื่อมต่อ', public details?: any) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ServerError extends Error implements AppError {
  code = 'SERVER_ERROR';
  
  constructor(message: string, public statusCode: number = 500, public details?: any) {
    super(message);
    this.name = 'ServerError';
  }
}

// Error handling utilities
export const errorHandlers = {
  // Handle form validation errors
  handleValidationErrors: (errors: Record<string, any>): FormError[] => {
    return Object.entries(errors).map(([field, error]) => ({
      field,
      message: error.message || 'ข้อมูลไม่ถูกต้อง',
      type: 'validation' as const
    }));
  },

  // Handle API response errors
  handleApiError: (error: any): AppError => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return new ServerError(
        data.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์',
        status,
        data
      );
    } else if (error.request) {
      // Network error
      return new NetworkError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } else {
      // Other error
      return new Error(error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ');
    }
  },

  // Handle timeout errors
  handleTimeoutError: (): NetworkError => {
    return new NetworkError('การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง');
  },

  // Handle rate limit errors
  handleRateLimitError: (): ServerError => {
    return new ServerError('ใช้งานบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่', 429);
  }
};

// Error message formatting
export const formatErrorMessage = (error: AppError | Error): string => {
  if (error instanceof ValidationError) {
    return `ข้อมูลไม่ถูกต้อง: ${error.message}`;
  } else if (error instanceof NetworkError) {
    return `ปัญหาการเชื่อมต่อ: ${error.message}`;
  } else if (error instanceof ServerError) {
    if (error.statusCode === 429) {
      return 'ใช้งานบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่';
    } else if (error.statusCode === 500) {
      return 'เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่ในภายหลัง';
    }
    return `ข้อผิดพลาดจากเซิร์ฟเวอร์: ${error.message}`;
  }
  return error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
};

// Retry logic for failed requests
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Don't retry on validation errors
      if (error instanceof ValidationError) {
        throw error;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};