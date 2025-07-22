import { useState, useCallback } from 'react';
import { AIRequest, AIResponse, StudySheetContent, StudySheetForm } from '@/types';
import { aiService, createAIRequest, isAIServiceError } from '@/services/aiService';
import { errorHandler, retryWithBackoff } from '@/services/errorHandler';
import { fallbackContentGenerator } from '@/services/fallbackContentGenerator';
import { cacheService } from '@/services/cacheService';

interface UseAIState {
  isGenerating: boolean;
  content: StudySheetContent | null;
  error: string | null;
  progress: number;
  isFallbackMode: boolean;
  errorDetails: any | null;
  cacheHit: boolean;
}

interface UseAIReturn extends UseAIState {
  generateContent: (request: AIRequest, modelId?: string) => Promise<boolean>;
  generateFallbackContent: (formData: StudySheetForm) => Promise<boolean>;
  generateEmergencyContent: (topic: string) => boolean;
  setContent: (content: StudySheetContent) => void;
  clearContent: () => void;
  clearError: () => void;
  retryGeneration: () => Promise<boolean>;
  retryWithFallback: (formData: StudySheetForm) => Promise<boolean>;
  serviceStatus: ReturnType<typeof aiService.getServiceStatus>;
}

export const useAI = (): UseAIReturn => {
  const [state, setState] = useState<UseAIState>({
    isGenerating: false,
    content: null,
    error: null,
    progress: 0,
    isFallbackMode: false,
    errorDetails: null,
    cacheHit: false
  });

  const [lastRequest, setLastRequest] = useState<AIRequest | null>(null);
  const [lastModelId, setLastModelId] = useState<string | undefined>(undefined);

  // Simulate progress for better UX
  const simulateProgress = useCallback(() => {
    return new Promise<void>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 90) {
          clearInterval(interval);
          setState(prev => ({ ...prev, progress: 90 }));
          resolve();
        } else {
          setState(prev => ({ ...prev, progress }));
        }
      }, 200);
    });
  }, []);

  const generateContent = useCallback(async (request: AIRequest, modelId?: string): Promise<boolean> => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
      progress: 0,
      content: null,
      isFallbackMode: false,
      errorDetails: null,
      cacheHit: false
    }));

    setLastRequest(request);
    setLastModelId(modelId);

    try {
      console.log('🚀 Starting content generation:', request);

      // Extract form parameters for cache key
      const formParams = {
        topic: request.topic,
        gradeLevel: request.gradeLevel,
        contentAmount: request.contentAmount,
        exerciseAmount: request.exerciseAmount,
        model: modelId
      };

      // Try to get from cache first
      const cachedContent = cacheService.getCachedAIResponse(formParams);
      if (cachedContent) {
        console.log('🚀 Cache hit! Using cached content');
        
        // Simulate some loading time for better UX even with cache
        setState(prev => ({ ...prev, progress: 50 }));
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setState(prev => ({
          ...prev,
          isGenerating: false,
          content: cachedContent,
          progress: 100,
          error: null,
          cacheHit: true
        }));
        
        return true;
      }

      console.log('🔍 Cache miss, generating new content');

      // Start progress simulation
      const progressPromise = simulateProgress();

      // Use retry mechanism with error handling
      const response: AIResponse = await retryWithBackoff(
        () => aiService.generateStudySheet(request, modelId),
        3, // max attempts
        1000, // base delay
        {
          component: 'useAI',
          action: 'generateContent',
          timestamp: new Date(),
          additionalData: { request, modelId }
        }
      );

      // Wait for progress to reach 90%
      await progressPromise;

      if (response.success && response.data) {
        console.log('✅ Content generation successful');
        
        // Cache the successful response
        cacheService.cacheAIResponse(formParams, response.data);
        
        setState(prev => ({
          ...prev,
          isGenerating: false,
          content: response.data!,
          progress: 100,
          error: null,
          cacheHit: false
        }));

        return true;
      } else {
        console.error('❌ Content generation failed:', response.error);
        
        // Handle error with error handler
        const errorInfo = errorHandler.handleError(
          new Error(response.error || 'AI content generation failed'),
          {
            component: 'useAI',
            action: 'generateContent',
            timestamp: new Date(),
            additionalData: { request, modelId, response }
          }
        );
        
        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: errorHandler.formatUserMessage(errorInfo),
          progress: 0,
          errorDetails: errorInfo
        }));

        return false;
      }
    } catch (error) {
      console.error('💥 Unexpected error during content generation:', error);
      
      // Handle error with comprehensive error handling
      const errorInfo = errorHandler.handleError(error, {
        component: 'useAI',
        action: 'generateContent',
        timestamp: new Date(),
        additionalData: { request, modelId }
      });

      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorHandler.formatUserMessage(errorInfo),
        progress: 0,
        errorDetails: errorInfo
      }));

      return false;
    }
  }, [simulateProgress]);

  // Generate fallback content when AI fails
  const generateFallbackContent = useCallback(async (formData: StudySheetForm): Promise<boolean> => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
      progress: 0,
      isFallbackMode: true
    }));

    try {
      // Simulate some processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({ ...prev, progress: 50 }));
      
      const fallbackContent = fallbackContentGenerator.generateFallbackContent(formData, {
        includeExercises: true,
        includeActivities: true,
        useBasicStructure: false,
        customizeForGrade: true
      });

      setState(prev => ({ ...prev, progress: 90 }));
      
      // Final delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        content: fallbackContent,
        progress: 100,
        error: null,
        isFallbackMode: true
      }));

      console.log('✅ Fallback content generated successfully');
      return true;
    } catch (error) {
      console.error('❌ Fallback content generation failed:', error);
      
      const errorInfo = errorHandler.handleError(error, {
        component: 'useAI',
        action: 'generateFallbackContent',
        timestamp: new Date(),
        additionalData: { formData }
      });

      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorHandler.formatUserMessage(errorInfo),
        progress: 0,
        errorDetails: errorInfo
      }));

      return false;
    }
  }, []);

  // Generate minimal emergency content
  const generateEmergencyContent = useCallback((topic: string): boolean => {
    try {
      const emergencyContent = fallbackContentGenerator.generateEmergencyContent(topic);
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        content: emergencyContent,
        progress: 100,
        error: null,
        isFallbackMode: true
      }));

      console.log('✅ Emergency content generated');
      return true;
    } catch (error) {
      console.error('❌ Emergency content generation failed:', error);
      
      const errorInfo = errorHandler.handleError(error, {
        component: 'useAI',
        action: 'generateEmergencyContent',
        timestamp: new Date(),
        additionalData: { topic }
      });

      setState(prev => ({
        ...prev,
        error: errorHandler.formatUserMessage(errorInfo),
        errorDetails: errorInfo
      }));

      return false;
    }
  }, []);

  const retryGeneration = useCallback(async (): Promise<boolean> => {
    if (!lastRequest) {
      setState(prev => ({
        ...prev,
        error: 'ไม่มีข้อมูลสำหรับลองใหม่'
      }));
      return false;
    }

    return generateContent(lastRequest, lastModelId);
  }, [lastRequest, lastModelId, generateContent]);

  // Retry with fallback option
  const retryWithFallback = useCallback(async (formData: StudySheetForm): Promise<boolean> => {
    // First try AI generation
    if (lastRequest) {
      const success = await generateContent(lastRequest, lastModelId);
      if (success) return true;
    }

    // If AI fails, use fallback
    console.log('🔄 AI failed, switching to fallback content generation');
    return generateFallbackContent(formData);
  }, [lastRequest, lastModelId, generateContent, generateFallbackContent]);

  const setContent = useCallback((content: StudySheetContent) => {
    setState(prev => ({
      ...prev,
      content,
      error: null,
      progress: 100
    }));
  }, []);

  const clearContent = useCallback(() => {
    setState(prev => ({
      ...prev,
      content: null,
      error: null,
      progress: 0,
      isFallbackMode: false,
      errorDetails: null
    }));
    setLastRequest(null);
    setLastModelId(undefined);
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      errorDetails: null
    }));
  }, []);

  const serviceStatus = aiService.getServiceStatus();

  return {
    ...state,
    generateContent,
    generateFallbackContent,
    generateEmergencyContent,
    setContent,
    clearContent,
    clearError,
    retryGeneration,
    retryWithFallback,
    serviceStatus
  };
};

// Helper hook for creating AI requests
export const useCreateAIRequest = () => {
  return useCallback(createAIRequest, []);
};