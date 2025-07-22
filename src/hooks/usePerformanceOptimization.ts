import { useState, useEffect, useCallback, useRef } from 'react';
import { performanceService } from '@/services/performanceService';
import { cacheService } from '@/services/cacheService';
import { imageOptimizationService } from '@/services/imageOptimizationService';

export interface PerformanceOptions {
  enableCaching: boolean;
  enableImageOptimization: boolean;
  enableProgressiveLoading: boolean;
  maxResponseTime: number; // 3000ms as per requirement
  enablePerformanceMonitoring: boolean;
  chunkSize: number; // For large operations
}

export interface PerformanceState {
  isOptimizing: boolean;
  currentOperation: string;
  responseTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  performanceScore: number;
  warnings: string[];
  isWithinBudget: boolean;
}

const DEFAULT_OPTIONS: PerformanceOptions = {
  enableCaching: true,
  enableImageOptimization: true,
  enableProgressiveLoading: true,
  maxResponseTime: 3000, // 3 seconds as required
  enablePerformanceMonitoring: true,
  chunkSize: 10 // Process 10 items at a time
};

export const usePerformanceOptimization = (options: Partial<PerformanceOptions> = {}) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const [state, setState] = useState<PerformanceState>({
    isOptimizing: false,
    currentOperation: '',
    responseTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    performanceScore: 100,
    warnings: [],
    isWithinBudget: true
  });

  const performanceTimers = useRef<Map<string, number>>(new Map());
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  // Monitor performance metrics
  useEffect(() => {
    if (!config.enablePerformanceMonitoring) return;

    const updateMetrics = () => {
      const report = performanceService.generateReport();
      const cacheStats = cacheService.getStats();
      const performanceScore = performanceService.getPerformanceScore();
      const imageStats = imageOptimizationService.getLoadingStats();

      setState(prev => ({
        ...prev,
        responseTime: report.averageResponseTime,
        cacheHitRate: cacheStats.hitRate,
        memoryUsage: report.memoryUsage,
        performanceScore,
        isWithinBudget: report.averageResponseTime <= config.maxResponseTime,
        warnings: report.recommendations
      }));
    };

    // Initial update
    updateMetrics();

    // Set up periodic updates
    const interval = setInterval(updateMetrics, 5000);

    // Listen for performance warnings
    const handlePerformanceWarning = (event: CustomEvent) => {
      const { type, metric } = event.detail;
      setState(prev => ({
        ...prev,
        warnings: [...prev.warnings, `Performance warning: ${type} exceeded budget`]
      }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('performance-warning', handlePerformanceWarning as EventListener);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('performance-warning', handlePerformanceWarning as EventListener);
      }
    };
  }, [config.enablePerformanceMonitoring, config.maxResponseTime]);

  // Optimized operation wrapper with timeout and chunking
  const optimizedOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>,
    options: {
      timeout?: number;
      enableCaching?: boolean;
      cacheKey?: string;
      chunkOperation?: boolean;
    } = {}
  ): Promise<T> => {
    const {
      timeout = config.maxResponseTime,
      enableCaching = config.enableCaching,
      cacheKey,
      chunkOperation = false
    } = options;

    // Check cache first if enabled
    if (enableCaching && cacheKey) {
      const cached = cacheService.get<T>(cacheKey);
      if (cached) {
        console.log(`🚀 Performance: Cache hit for ${operationName}`);
        return cached;
      }
    }

    setState(prev => ({ ...prev, isOptimizing: true, currentOperation: operationName }));

    // Start performance monitoring
    performanceService.startSession(operationName);
    const startTime = Date.now();
    performanceTimers.current.set(operationName, startTime);

    // Create abort controller for timeout
    const controller = new AbortController();
    abortControllers.current.set(operationName, controller);

    // Set timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.warn(`⚠️ Performance: Operation ${operationName} timed out after ${timeout}ms`);
    }, timeout);

    try {
      const result = await performanceService.measureOperation(operationName, async () => {
        // Add timeout to the operation
        const operationPromise = operation();
        
        return Promise.race([
          operationPromise,
          new Promise<never>((_, reject) => {
            controller.signal.addEventListener('abort', () => {
              reject(new Error(`Operation ${operationName} timed out after ${timeout}ms`));
            });
          })
        ]);
      });

      const responseTime = Date.now() - startTime;

      // Cache successful results if enabled
      if (enableCaching && cacheKey && result) {
        cacheService.set(cacheKey, result);
      }

      // Update performance state
      setState(prev => ({
        ...prev,
        responseTime,
        isWithinBudget: responseTime <= config.maxResponseTime
      }));

      console.log(`✅ Performance: ${operationName} completed in ${responseTime}ms`);

      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      setState(prev => ({
        ...prev,
        responseTime,
        isWithinBudget: false,
        warnings: [...prev.warnings, `Operation ${operationName} failed or timed out`]
      }));

      console.error(`❌ Performance: ${operationName} failed after ${responseTime}ms:`, error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
      performanceService.endSession(operationName);
      performanceTimers.current.delete(operationName);
      abortControllers.current.delete(operationName);
      
      setState(prev => ({ ...prev, isOptimizing: false, currentOperation: '' }));
    }
  }, [config]);

  // Progressive loading for large datasets
  const progressiveLoad = useCallback(async <T>(
    items: T[],
    processor: (item: T) => Promise<any>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<any[]> => {
    if (!config.enableProgressiveLoading) {
      return Promise.all(items.map(processor));
    }

    const results: any[] = [];
    const chunks = [];
    
    // Split into chunks
    for (let i = 0; i < items.length; i += config.chunkSize) {
      chunks.push(items.slice(i, i + config.chunkSize));
    }

    console.log(`📦 Performance: Processing ${items.length} items in ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkResults = await Promise.all(chunk.map(processor));
      results.push(...chunkResults);

      // Report progress
      onProgress?.(results.length, items.length);

      // Small delay to prevent blocking
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    return results;
  }, [config.chunkSize, config.enableProgressiveLoading]);

  // Preload critical resources
  const preloadCriticalResources = useCallback(async (resources: string[]): Promise<void> => {
    if (!config.enableImageOptimization) return;

    return optimizedOperation('preload-resources', async () => {
      const imageUrls = resources.filter(url => /\.(jpg|jpeg|png|webp|gif)$/i.test(url));
      const otherUrls = resources.filter(url => !/\.(jpg|jpeg|png|webp|gif)$/i.test(url));

      // Preload images with optimization
      if (imageUrls.length > 0) {
        await imageOptimizationService.preloadImages(imageUrls);
      }

      // Preload other resources
      await Promise.all(
        otherUrls.map(url => fetch(url, { method: 'HEAD' }).catch(() => {}))
      );
    }, { timeout: 5000 });
  }, [config.enableImageOptimization, optimizedOperation]);

  // Debounced operation for frequent calls
  const debouncedOperation = useCallback(
    debounce(async (operation: () => Promise<any>, delay: number = 300) => {
      return operation();
    }, 300),
    []
  );

  // Memory cleanup
  const cleanup = useCallback(() => {
    // Clear timers
    performanceTimers.current.clear();
    
    // Abort ongoing operations
    abortControllers.current.forEach(controller => controller.abort());
    abortControllers.current.clear();

    // Clear cache if needed
    const report = performanceService.generateReport();
    if (report.memoryUsage > 80) {
      console.log('🧹 Performance: Clearing cache due to high memory usage');
      cacheService.clear();
      imageOptimizationService.clearCache();
    }
  }, []);

  // Auto cleanup on high memory usage
  useEffect(() => {
    const checkMemory = () => {
      const report = performanceService.generateReport();
      if (report.memoryUsage > 90) {
        console.warn('⚠️ Performance: High memory usage detected, triggering cleanup');
        cleanup();
      }
    };

    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [cleanup]);

  // Performance recommendations
  const getRecommendations = useCallback((): string[] => {
    const recommendations: string[] = [];
    
    if (state.responseTime > config.maxResponseTime) {
      recommendations.push('Consider enabling caching or reducing operation complexity');
    }
    
    if (state.cacheHitRate < 60) {
      recommendations.push('Cache hit rate is low, consider adjusting cache TTL');
    }
    
    if (state.memoryUsage > 70) {
      recommendations.push('Memory usage is high, consider clearing cache or optimizing data structures');
    }
    
    if (state.performanceScore < 80) {
      recommendations.push('Overall performance score is low, review all optimizations');
    }

    return recommendations;
  }, [state, config.maxResponseTime]);

  // Force performance budget compliance
  const enforcePerformanceBudget = useCallback(async <T>(
    operation: () => Promise<T>,
    fallback: () => T | Promise<T>,
    budgetMs: number = config.maxResponseTime
  ): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Performance budget exceeded')), budgetMs);
    });

    try {
      return await Promise.race([operation(), timeoutPromise]);
    } catch (error) {
      console.warn(`⚠️ Performance budget exceeded, falling back`);
      return fallback();
    }
  }, [config.maxResponseTime]);

  return {
    // State
    ...state,
    
    // Operations
    optimizedOperation,
    progressiveLoad,
    preloadCriticalResources,
    debouncedOperation,
    enforcePerformanceBudget,
    
    // Utilities
    cleanup,
    getRecommendations,
    
    // Configuration
    updateConfig: (newConfig: Partial<PerformanceOptions>) => {
      Object.assign(config, newConfig);
    }
  };
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => resolve(func(...args)), wait);
    });
  };
}