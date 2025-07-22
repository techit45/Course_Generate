import { cacheService } from './cacheService';

export interface PerformanceMetrics {
  responseTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  timestamp: number;
  operation: string;
  status: 'success' | 'error' | 'timeout';
}

export interface PerformanceBudget {
  maxResponseTime: number; // 3000ms as per requirement
  minCacheHitRate: number; // 60% target
  maxMemoryUsage: number; // 100MB target
  warningThreshold: number; // 2500ms warning
}

export interface PerformanceReport {
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  operationCounts: Record<string, number>;
  budgetCompliance: {
    responseTime: boolean;
    cacheHitRate: boolean;
    memoryUsage: boolean;
  };
  recommendations: string[];
}

class PerformanceService {
  private static instance: PerformanceService;
  private metrics: PerformanceMetrics[] = [];
  private budget: PerformanceBudget = {
    maxResponseTime: 3000, // 3 seconds as required
    minCacheHitRate: 60,
    maxMemoryUsage: 100,
    warningThreshold: 2500
  };

  private maxMetricsHistory = 1000; // Keep last 1000 metrics
  private observers: ((metric: PerformanceMetrics) => void)[] = [];

  private constructor() {
    this.startMemoryMonitoring();
    this.setupPerformanceObserver();
  }

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  // Start monitoring memory usage periodically
  private startMemoryMonitoring(): void {
    setInterval(() => {
      this.recordMemoryUsage();
    }, 30000); // Check every 30 seconds
  }

  // Set up Performance Observer for real-time monitoring
  private setupPerformanceObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.includes('gencouce')) {
              this.recordMetric({
                responseTime: entry.duration,
                cacheHitRate: 0, // Will be updated by specific operations
                memoryUsage: this.getCurrentMemoryUsage(),
                timestamp: Date.now(),
                operation: entry.name,
                status: 'success'
              });
            }
          }
        });

        observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  // Record a performance metric
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    // Check against budget and warn if necessary
    this.checkBudgetCompliance(metric);

    // Notify observers
    this.observers.forEach(observer => observer(metric));

    console.log(`📊 Performance: ${metric.operation} - ${metric.responseTime.toFixed(2)}ms (${metric.status})`);
  }

  // Measure and record an operation
  async measureOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    const startMemory = this.getCurrentMemoryUsage();

    try {
      const result = await operation();
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.recordMetric({
        responseTime,
        cacheHitRate: cacheService.getStats().hitRate,
        memoryUsage: this.getCurrentMemoryUsage(),
        timestamp: Date.now(),
        operation: operationName,
        status: responseTime > this.budget.maxResponseTime ? 'timeout' : 'success'
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.recordMetric({
        responseTime,
        cacheHitRate: cacheService.getStats().hitRate,
        memoryUsage: this.getCurrentMemoryUsage(),
        timestamp: Date.now(),
        operation: operationName,
        status: 'error'
      });

      throw error;
    }
  }

  // Measure synchronous operations
  measureSync<T>(operationName: string, operation: () => T): T {
    const startTime = performance.now();

    try {
      const result = operation();
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.recordMetric({
        responseTime,
        cacheHitRate: cacheService.getStats().hitRate,
        memoryUsage: this.getCurrentMemoryUsage(),
        timestamp: Date.now(),
        operation: operationName,
        status: responseTime > this.budget.maxResponseTime ? 'timeout' : 'success'
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      this.recordMetric({
        responseTime,
        cacheHitRate: cacheService.getStats().hitRate,
        memoryUsage: this.getCurrentMemoryUsage(),
        timestamp: Date.now(),
        operation: operationName,
        status: 'error'
      });

      throw error;
    }
  }

  // Get current memory usage (approximate)
  private getCurrentMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  }

  // Record memory usage metric
  private recordMemoryUsage(): void {
    const memoryUsage = this.getCurrentMemoryUsage();
    if (memoryUsage > 0) {
      this.recordMetric({
        responseTime: 0,
        cacheHitRate: cacheService.getStats().hitRate,
        memoryUsage,
        timestamp: Date.now(),
        operation: 'memory-check',
        status: 'success'
      });
    }
  }

  // Check if metric complies with performance budget
  private checkBudgetCompliance(metric: PerformanceMetrics): void {
    if (metric.responseTime > this.budget.maxResponseTime) {
      console.warn(`⚠️ Performance Budget Violation: ${metric.operation} took ${metric.responseTime.toFixed(2)}ms (budget: ${this.budget.maxResponseTime}ms)`);
      
      // Emit performance warning event
      this.emitPerformanceWarning('responseTime', metric);
    }

    if (metric.responseTime > this.budget.warningThreshold) {
      console.warn(`⚡ Performance Warning: ${metric.operation} took ${metric.responseTime.toFixed(2)}ms (approaching budget limit)`);
    }

    if (metric.memoryUsage > this.budget.maxMemoryUsage) {
      console.warn(`⚠️ Memory Budget Violation: ${metric.memoryUsage.toFixed(2)}MB (budget: ${this.budget.maxMemoryUsage}MB)`);
      
      this.emitPerformanceWarning('memoryUsage', metric);
    }

    if (metric.cacheHitRate < this.budget.minCacheHitRate && metric.operation !== 'memory-check') {
      console.warn(`⚠️ Cache Hit Rate Low: ${metric.cacheHitRate.toFixed(1)}% (target: ${this.budget.minCacheHitRate}%)`);
      
      this.emitPerformanceWarning('cacheHitRate', metric);
    }
  }

  // Emit performance warning
  private emitPerformanceWarning(type: string, metric: PerformanceMetrics): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('performance-warning', {
        detail: { type, metric, budget: this.budget }
      }));
    }
  }

  // Generate performance report
  generateReport(): PerformanceReport {
    if (this.metrics.length === 0) {
      return {
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        cacheHitRate: 0,
        memoryUsage: 0,
        operationCounts: {},
        budgetCompliance: {
          responseTime: true,
          cacheHitRate: true,
          memoryUsage: true
        },
        recommendations: ['Insufficient data for analysis']
      };
    }

    const responseTimes = this.metrics.map(m => m.responseTime).sort((a, b) => a - b);
    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const p95ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.95)] || 0;
    const p99ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.99)] || 0;
    
    const cacheStats = cacheService.getStats();
    const currentMemoryUsage = this.getCurrentMemoryUsage();

    // Count operations
    const operationCounts: Record<string, number> = {};
    this.metrics.forEach(metric => {
      operationCounts[metric.operation] = (operationCounts[metric.operation] || 0) + 1;
    });

    // Check budget compliance
    const budgetCompliance = {
      responseTime: p95ResponseTime <= this.budget.maxResponseTime,
      cacheHitRate: cacheStats.hitRate >= this.budget.minCacheHitRate,
      memoryUsage: currentMemoryUsage <= this.budget.maxMemoryUsage
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      averageResponseTime,
      p95ResponseTime,
      cacheHitRate: cacheStats.hitRate,
      memoryUsage: currentMemoryUsage,
      budgetCompliance
    });

    return {
      averageResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      cacheHitRate: cacheStats.hitRate,
      memoryUsage: currentMemoryUsage,
      operationCounts,
      budgetCompliance,
      recommendations
    };
  }

  // Generate performance recommendations
  private generateRecommendations(report: {
    averageResponseTime: number;
    p95ResponseTime: number;
    cacheHitRate: number;
    memoryUsage: number;
    budgetCompliance: any;
  }): string[] {
    const recommendations: string[] = [];

    if (!report.budgetCompliance.responseTime) {
      recommendations.push(`Response times exceed budget (${report.p95ResponseTime.toFixed(0)}ms > ${this.budget.maxResponseTime}ms). Consider optimizing AI requests or increasing cache usage.`);
    }

    if (report.averageResponseTime > 2000) {
      recommendations.push('Average response time is high. Consider implementing progressive loading or breaking operations into smaller chunks.');
    }

    if (!report.budgetCompliance.cacheHitRate) {
      recommendations.push(`Cache hit rate is low (${report.cacheHitRate.toFixed(1)}%). Consider increasing cache TTL or implementing cache warming strategies.`);
    }

    if (report.cacheHitRate > 80) {
      recommendations.push('Excellent cache performance! Consider increasing cache size to maintain this rate as usage grows.');
    }

    if (!report.budgetCompliance.memoryUsage) {
      recommendations.push(`Memory usage is high (${report.memoryUsage.toFixed(1)}MB). Consider optimizing data structures or implementing data compression.`);
    }

    if (report.memoryUsage < 20) {
      recommendations.push('Memory usage is efficient. Consider increasing cache size for better performance.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is within acceptable limits. Continue monitoring for trends.');
    }

    return recommendations;
  }

  // Add performance observer
  addObserver(callback: (metric: PerformanceMetrics) => void): void {
    this.observers.push(callback);
  }

  // Remove performance observer
  removeObserver(callback: (metric: PerformanceMetrics) => void): void {
    const index = this.observers.indexOf(callback);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  // Update performance budget
  updateBudget(newBudget: Partial<PerformanceBudget>): void {
    this.budget = { ...this.budget, ...newBudget };
    console.log('Performance budget updated:', this.budget);
  }

  // Get recent metrics for analysis
  getRecentMetrics(minutes: number = 5): PerformanceMetrics[] {
    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    return this.metrics.filter(metric => metric.timestamp > cutoffTime);
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics = [];
    console.log('Performance metrics cleared');
  }

  // Export metrics for analysis
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      budget: this.budget,
      report: this.generateReport(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  // Check if operation should be flagged as slow
  isSlowOperation(responseTime: number): boolean {
    return responseTime > this.budget.warningThreshold;
  }

  // Get performance score (0-100)
  getPerformanceScore(): number {
    const report = this.generateReport();
    let score = 100;

    // Response time impact (40% weight)
    const responseTimePenalty = Math.max(0, (report.p95ResponseTime - this.budget.maxResponseTime) / this.budget.maxResponseTime * 40);
    score -= responseTimePenalty;

    // Cache hit rate impact (30% weight)
    const cacheHitPenalty = Math.max(0, (this.budget.minCacheHitRate - report.cacheHitRate) / this.budget.minCacheHitRate * 30);
    score -= cacheHitPenalty;

    // Memory usage impact (20% weight)
    const memoryPenalty = Math.max(0, (report.memoryUsage - this.budget.maxMemoryUsage) / this.budget.maxMemoryUsage * 20);
    score -= memoryPenalty;

    // Error rate impact (10% weight)
    const errorRate = this.metrics.filter(m => m.status === 'error').length / Math.max(1, this.metrics.length);
    const errorPenalty = errorRate * 10;
    score -= errorPenalty;

    return Math.max(0, Math.min(100, score));
  }

  // Start performance monitoring session
  startSession(sessionName: string): void {
    console.log(`📊 Performance monitoring started: ${sessionName}`);
    performance.mark(`gencouce-${sessionName}-start`);
  }

  // End performance monitoring session
  endSession(sessionName: string): void {
    performance.mark(`gencouce-${sessionName}-end`);
    performance.measure(`gencouce-${sessionName}`, `gencouce-${sessionName}-start`, `gencouce-${sessionName}-end`);
    console.log(`📊 Performance monitoring ended: ${sessionName}`);
  }
}

export const performanceService = PerformanceService.getInstance();