import { StudySheetContent } from '@/types';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  averageResponseTime: number;
  oldestEntry: number;
  newestEntry: number;
}

export interface CacheConfig {
  maxEntries: number;
  maxSize: number; // in MB
  defaultTTL: number; // in milliseconds
  compressionEnabled: boolean;
  persistToLocalStorage: boolean;
}

export class CacheService {
  private static instance: CacheService;
  private cache = new Map<string, CacheEntry<any>>();
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    responseTimes: [] as number[]
  };

  private config: CacheConfig = {
    maxEntries: 100,
    maxSize: 50, // 50MB
    defaultTTL: 30 * 60 * 1000, // 30 minutes
    compressionEnabled: true,
    persistToLocalStorage: true
  };

  private constructor() {
    this.loadFromLocalStorage();
    this.startCleanupTimer();
    
    // Listen for storage events from other tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.saveToLocalStorage();
      });
    }
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Generate cache key from request parameters
  private generateKey(params: {
    topic: string;
    gradeLevel: string;
    contentAmount: string;
    exerciseAmount: string;
    model?: string;
  }): string {
    const normalizedParams = {
      topic: params.topic.toLowerCase().trim(),
      gradeLevel: params.gradeLevel,
      contentAmount: params.contentAmount,
      exerciseAmount: params.exerciseAmount,
      model: params.model || 'default'
    };
    
    return btoa(JSON.stringify(normalizedParams))
      .replace(/[+/=]/g, (match) => ({ '+': '-', '/': '_', '=': '' }[match] || match));
  }

  // Calculate data size for memory management
  private calculateSize(data: any): number {
    const jsonString = JSON.stringify(data);
    return new Blob([jsonString]).size / (1024 * 1024); // Size in MB
  }

  // Compress data for storage efficiency
  private compressData(data: any): string {
    if (!this.config.compressionEnabled) {
      return JSON.stringify(data);
    }

    // Simple compression - remove whitespace and optimize structure
    const compressed = JSON.stringify(data, (key, value) => {
      // Optimize text content by removing extra whitespace
      if (typeof value === 'string' && key !== 'id') {
        return value.trim().replace(/\s+/g, ' ');
      }
      return value;
    });

    return compressed;
  }

  // Decompress data
  private decompressData(compressedData: string): any {
    return JSON.parse(compressedData);
  }

  // LRU eviction - remove least recently used entries
  private evictLRU(): void {
    if (this.cache.size === 0) return;

    let oldestKey = '';
    let oldestAccess = Date.now();

    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`Cache: Evicted LRU entry ${oldestKey}`);
    }
  }

  // Size-based eviction - remove largest entries first
  private evictBySize(): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => b[1].size - a[1].size);

    // Remove largest entries until we're under the size limit
    let currentSize = this.getTotalSize();
    const maxSizeBytes = this.config.maxSize * 1024 * 1024;

    for (const [key, entry] of entries) {
      if (currentSize <= maxSizeBytes) break;
      
      this.cache.delete(key);
      currentSize -= entry.size * 1024 * 1024;
      console.log(`Cache: Evicted large entry ${key} (${entry.size.toFixed(2)}MB)`);
    }
  }

  // Check if entry is expired
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiresAt;
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.cache.delete(key);
    });

    if (expiredKeys.length > 0) {
      console.log(`Cache: Cleaned up ${expiredKeys.length} expired entries`);
    }
  }

  // Start automatic cleanup timer
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Cleanup every 5 minutes
  }

  // Get total cache size
  private getTotalSize(): number {
    let totalSize = 0;
    Array.from(this.cache.values()).forEach(entry => {
      totalSize += entry.size * 1024 * 1024; // Convert MB to bytes
    });
    return totalSize;
  }

  // Store data in cache
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const size = this.calculateSize(data);
    const expiresAt = now + (ttl || this.config.defaultTTL);

    // Check size limits before adding
    const maxSizeBytes = this.config.maxSize * 1024 * 1024;
    if (size * 1024 * 1024 > maxSizeBytes * 0.1) { // Don't cache items larger than 10% of max size
      console.warn(`Cache: Item too large to cache (${size.toFixed(2)}MB)`);
      return;
    }

    // Evict entries if necessary
    while (this.cache.size >= this.config.maxEntries) {
      this.evictLRU();
    }

    while (this.getTotalSize() + (size * 1024 * 1024) > maxSizeBytes) {
      this.evictBySize();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt,
      size,
      accessCount: 0,
      lastAccessed: now
    };

    this.cache.set(key, entry);
    console.log(`Cache: Stored entry ${key} (${size.toFixed(2)}MB, expires in ${Math.round((expiresAt - now) / 1000)}s)`);
  }

  // Retrieve data from cache
  get<T>(key: string): T | null {
    const startTime = performance.now();
    this.stats.totalRequests++;

    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.recordResponseTime(performance.now() - startTime);
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.recordResponseTime(performance.now() - startTime);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    
    const responseTime = performance.now() - startTime;
    this.recordResponseTime(responseTime);
    
    console.log(`Cache: Hit for ${key} (${responseTime.toFixed(2)}ms, accessed ${entry.accessCount} times)`);
    return entry.data;
  }

  // Cache AI response with intelligent key generation
  cacheAIResponse(params: {
    topic: string;
    gradeLevel: string;
    contentAmount: string;
    exerciseAmount: string;
    model?: string;
  }, content: StudySheetContent): void {
    const key = this.generateKey(params);
    this.set(key, {
      content,
      params,
      generatedAt: new Date().toISOString(),
      cacheVersion: '1.0'
    });
  }

  // Retrieve cached AI response
  getCachedAIResponse(params: {
    topic: string;
    gradeLevel: string;
    contentAmount: string;
    exerciseAmount: string;
    model?: string;
  }): StudySheetContent | null {
    const key = this.generateKey(params);
    const cached = this.get<{
      content: StudySheetContent;
      params: any;
      generatedAt: string;
      cacheVersion: string;
    }>(key);
    
    if (cached && cached.content) {
      console.log(`Cache: Retrieved AI response for topic: ${params.topic}`);
      return cached.content;
    }
    
    return null;
  }

  // Record response time for analytics
  private recordResponseTime(time: number): void {
    this.stats.responseTimes.push(time);
    
    // Keep only last 100 response times
    if (this.stats.responseTimes.length > 100) {
      this.stats.responseTimes = this.stats.responseTimes.slice(-100);
    }
  }

  // Get cache statistics
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalSize = this.getTotalSize() / (1024 * 1024); // Convert to MB
    const hitRate = this.stats.totalRequests > 0 ? 
      (this.stats.hits / this.stats.totalRequests) * 100 : 0;
    const averageResponseTime = this.stats.responseTimes.length > 0 ?
      this.stats.responseTimes.reduce((sum, time) => sum + time, 0) / this.stats.responseTimes.length : 0;

    return {
      totalEntries: this.cache.size,
      totalSize,
      hitRate,
      missRate: 100 - hitRate,
      averageResponseTime,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : 0,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : 0
    };
  }

  // Clear all cache entries
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, totalRequests: 0, responseTimes: [] };
    console.log(`Cache: Cleared ${size} entries`);
  }

  // Remove specific cache entry
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result) {
      console.log(`Cache: Deleted entry ${key}`);
    }
    return result;
  }

  // Save cache to localStorage for persistence
  private saveToLocalStorage(): void {
    if (!this.config.persistToLocalStorage || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const cacheData = {
        entries: Array.from(this.cache.entries()),
        stats: this.stats,
        timestamp: Date.now()
      };

      const compressed = this.compressData(cacheData);
      localStorage.setItem('gencouce-cache', compressed);
      console.log(`Cache: Saved ${this.cache.size} entries to localStorage`);
    } catch (error) {
      console.warn('Cache: Failed to save to localStorage:', error);
    }
  }

  // Load cache from localStorage
  private loadFromLocalStorage(): void {
    if (!this.config.persistToLocalStorage || typeof localStorage === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem('gencouce-cache');
      if (!stored) return;

      const cacheData = this.decompressData(stored);
      const age = Date.now() - cacheData.timestamp;
      
      // Don't load cache older than 24 hours
      if (age > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('gencouce-cache');
        return;
      }

      // Restore cache entries, filtering out expired ones
      const now = Date.now();
      let restoredCount = 0;

      cacheData.entries.forEach(([key, entry]: [string, CacheEntry<any>]) => {
        if (entry.expiresAt > now) {
          this.cache.set(key, entry);
          restoredCount++;
        }
      });

      if (cacheData.stats) {
        this.stats = cacheData.stats;
      }

      console.log(`Cache: Restored ${restoredCount} entries from localStorage`);
    } catch (error) {
      console.warn('Cache: Failed to load from localStorage:', error);
      localStorage.removeItem('gencouce-cache');
    }
  }

  // Prefetch common combinations
  async prefetchCommonCombinations(): Promise<void> {
    const commonCombinations = [
      { gradeLevel: 'ม.1', contentAmount: 'ปานกลาง', exerciseAmount: 'ปานกลาง' },
      { gradeLevel: 'ม.2', contentAmount: 'ปานกลาง', exerciseAmount: 'ปานกลาง' },
      { gradeLevel: 'ม.3', contentAmount: 'ปานกลาง', exerciseAmount: 'ปานกลาง' }
    ];

    // This would be called during low-activity periods
    console.log('Cache: Prefetch strategy ready for common combinations');
  }

  // Update cache configuration
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Cache: Configuration updated', this.config);
  }

  // Export cache for debugging/analysis
  export(): any {
    return {
      entries: Array.from(this.cache.entries()),
      stats: this.stats,
      config: this.config,
      totalSize: this.getTotalSize(),
      exportedAt: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();