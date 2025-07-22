import { performanceService } from './performanceService';

export interface ImageOptimizationConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'webp' | 'jpeg' | 'png';
  enableLazyLoading: boolean;
  enablePlaceholder: boolean;
  placeholderQuality: number;
  compressionLevel: number;
}

export interface OptimizedImage {
  src: string;
  placeholder?: string;
  width: number;
  height: number;
  format: string;
  size: number;
  aspectRatio: number;
}

export interface ImageLoadingStats {
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  averageLoadTime: number;
  totalSize: number;
  compressionRatio: number;
}

class ImageOptimizationService {
  private static instance: ImageOptimizationService;
  private config: ImageOptimizationConfig = {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 0.8,
    format: 'webp',
    enableLazyLoading: true,
    enablePlaceholder: true,
    placeholderQuality: 0.1,
    compressionLevel: 0.7
  };

  private imageCache = new Map<string, OptimizedImage>();
  private loadingStats: ImageLoadingStats = {
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    totalSize: 0,
    compressionRatio: 0
  };

  private loadTimes: number[] = [];
  private observer: IntersectionObserver | null = null;

  private constructor() {
    this.setupLazyLoadingObserver();
    this.setupImageFormatSupport();
  }

  static getInstance(): ImageOptimizationService {
    if (!ImageOptimizationService.instance) {
      ImageOptimizationService.instance = new ImageOptimizationService();
    }
    return ImageOptimizationService.instance;
  }

  // Setup intersection observer for lazy loading
  private setupLazyLoadingObserver(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
              this.observer?.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before image enters viewport
          threshold: 0.1
        }
      );
    }
  }

  // Check browser support for modern image formats
  private setupImageFormatSupport(): void {
    if (typeof window !== 'undefined') {
      // Check WebP support
      const webpSupported = this.checkWebPSupport();
      if (!webpSupported && this.config.format === 'webp') {
        this.config.format = 'jpeg';
      }
    }
  }

  // Check WebP format support
  private checkWebPSupport(): boolean {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    try {
      return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
    } catch {
      return false;
    }
  }

  // Optimize image from file or blob
  async optimizeImage(
    source: File | Blob | string,
    options?: Partial<ImageOptimizationConfig>
  ): Promise<OptimizedImage> {
    return performanceService.measureOperation('image-optimization', async () => {
      const config = { ...this.config, ...options };
      
      let imageData: string;
      let originalSize = 0;

      if (source instanceof File || source instanceof Blob) {
        originalSize = source.size;
        imageData = await this.fileToDataURL(source);
      } else {
        imageData = source;
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(imageData, config);
      if (this.imageCache.has(cacheKey)) {
        return this.imageCache.get(cacheKey)!;
      }

      const optimized = await this.processImage(imageData, config, originalSize);
      
      // Cache the optimized image
      this.imageCache.set(cacheKey, optimized);
      
      return optimized;
    });
  }

  // Convert file/blob to data URL
  private fileToDataURL(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // Generate cache key for image
  private generateCacheKey(imageData: string, config: ImageOptimizationConfig): string {
    const configHash = btoa(JSON.stringify(config)).slice(0, 10);
    const imageHash = btoa(imageData.slice(0, 100)).slice(0, 10);
    return `${imageHash}-${configHash}`;
  }

  // Process and optimize image
  private async processImage(
    imageData: string,
    config: ImageOptimizationConfig,
    originalSize: number
  ): Promise<OptimizedImage> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // Calculate optimal dimensions
          const { width, height } = this.calculateOptimalDimensions(
            img.width,
            img.height,
            config.maxWidth,
            config.maxHeight
          );

          canvas.width = width;
          canvas.height = height;

          // Use high-quality image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height);

          // Get optimized format
          const mimeType = this.getMimeType(config.format);
          const optimizedDataURL = canvas.toDataURL(mimeType, config.quality);
          
          // Calculate size
          const optimizedSize = this.calculateDataURLSize(optimizedDataURL);
          const compressionRatio = originalSize > 0 ? optimizedSize / originalSize : 1;

          // Generate placeholder if enabled
          let placeholder: string | undefined;
          if (config.enablePlaceholder) {
            placeholder = this.generatePlaceholder(canvas, config.placeholderQuality);
          }

          // Update stats
          this.updateStats(originalSize, optimizedSize, compressionRatio);

          const optimizedImage: OptimizedImage = {
            src: optimizedDataURL,
            placeholder,
            width,
            height,
            format: config.format,
            size: optimizedSize,
            aspectRatio: width / height
          };

          resolve(optimizedImage);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        this.loadingStats.failedImages++;
        reject(new Error('Failed to load image'));
      };

      img.src = imageData;
    });
  }

  // Calculate optimal dimensions maintaining aspect ratio
  private calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = originalWidth;
    let height = originalHeight;

    // Scale down if too wide
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    // Scale down if too tall
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  // Get appropriate MIME type
  private getMimeType(format: string): string {
    switch (format) {
      case 'webp':
        return 'image/webp';
      case 'png':
        return 'image/png';
      case 'jpeg':
      default:
        return 'image/jpeg';
    }
  }

  // Generate low-quality placeholder
  private generatePlaceholder(canvas: HTMLCanvasElement, quality: number): string {
    // Create smaller canvas for placeholder
    const placeholderCanvas = document.createElement('canvas');
    const placeholderCtx = placeholderCanvas.getContext('2d');
    
    if (!placeholderCtx) return '';

    // Use much smaller dimensions for placeholder
    placeholderCanvas.width = Math.max(10, Math.round(canvas.width * 0.1));
    placeholderCanvas.height = Math.max(10, Math.round(canvas.height * 0.1));

    placeholderCtx.drawImage(canvas, 0, 0, placeholderCanvas.width, placeholderCanvas.height);
    
    return placeholderCanvas.toDataURL('image/jpeg', quality);
  }

  // Calculate data URL size in bytes
  private calculateDataURLSize(dataURL: string): number {
    const base64String = dataURL.split(',')[1];
    return Math.round((base64String.length * 3) / 4);
  }

  // Update loading statistics
  private updateStats(originalSize: number, optimizedSize: number, compressionRatio: number): void {
    this.loadingStats.totalImages++;
    this.loadingStats.loadedImages++;
    this.loadingStats.totalSize += optimizedSize;
    
    // Update compression ratio (running average)
    const currentAvg = this.loadingStats.compressionRatio;
    const count = this.loadingStats.loadedImages;
    this.loadingStats.compressionRatio = ((currentAvg * (count - 1)) + compressionRatio) / count;
  }

  // Load image with lazy loading support
  loadImage(img: HTMLImageElement): void {
    const startTime = performance.now();
    
    const dataSrc = img.dataset.src;
    if (!dataSrc) return;

    // Show placeholder if available
    const placeholder = img.dataset.placeholder;
    if (placeholder && !img.src) {
      img.src = placeholder;
      img.style.filter = 'blur(5px)';
      img.style.transition = 'filter 0.3s ease';
    }

    // Create new image for preloading
    const newImg = new Image();
    
    newImg.onload = () => {
      const loadTime = performance.now() - startTime;
      this.recordLoadTime(loadTime);
      
      // Replace with optimized image
      img.src = newImg.src;
      img.style.filter = 'none';
      
      // Add loading animation
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease';
      
      requestAnimationFrame(() => {
        img.style.opacity = '1';
      });
      
      // Remove data attributes
      delete img.dataset.src;
      delete img.dataset.placeholder;
    };

    newImg.onerror = () => {
      this.loadingStats.failedImages++;
      img.alt = 'Failed to load image';
    };

    newImg.src = dataSrc;
  }

  // Record image load time
  private recordLoadTime(time: number): void {
    this.loadTimes.push(time);
    
    // Keep only recent load times
    if (this.loadTimes.length > 100) {
      this.loadTimes = this.loadTimes.slice(-100);
    }
    
    // Update average
    this.loadingStats.averageLoadTime = 
      this.loadTimes.reduce((sum, time) => sum + time, 0) / this.loadTimes.length;
  }

  // Setup lazy loading for images
  setupLazyLoading(container: HTMLElement): void {
    if (!this.config.enableLazyLoading || !this.observer) return;

    const images = container.querySelectorAll('img[data-src]');
    images.forEach(img => {
      this.observer!.observe(img);
    });
  }

  // Create optimized image element
  createOptimizedImage(
    src: string,
    alt: string,
    options?: Partial<ImageOptimizationConfig>
  ): HTMLImageElement {
    const img = document.createElement('img');
    img.alt = alt;
    
    if (this.config.enableLazyLoading) {
      img.dataset.src = src;
      img.loading = 'lazy';
      
      // Add placeholder while loading
      img.style.backgroundColor = '#f0f0f0';
      img.style.minHeight = '100px';
      
      if (this.observer) {
        this.observer.observe(img);
      }
    } else {
      img.src = src;
    }

    return img;
  }

  // Preload critical images
  async preloadImages(urls: string[]): Promise<void> {
    return performanceService.measureOperation('image-preloading', async () => {
      const promises = urls.map(url => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Don't fail the entire batch
          img.src = url;
        });
      });

      await Promise.all(promises);
    });
  }

  // Optimize images in a container
  async optimizeImagesInContainer(container: HTMLElement): Promise<void> {
    return performanceService.measureOperation('container-image-optimization', async () => {
      const images = container.querySelectorAll('img');
      const optimizationPromises: Promise<void>[] = [];

      images.forEach(img => {
        if (img.src && !img.dataset.optimized) {
          const promise = this.optimizeExistingImage(img);
          optimizationPromises.push(promise);
        }
      });

      await Promise.all(optimizationPromises);
    });
  }

  // Optimize existing image element
  private async optimizeExistingImage(img: HTMLImageElement): Promise<void> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      // Wait for image to load if not already loaded
      await new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      });

      const { width, height } = this.calculateOptimalDimensions(
        img.naturalWidth,
        img.naturalHeight,
        this.config.maxWidth,
        this.config.maxHeight
      );

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      
      const optimizedDataURL = canvas.toDataURL(
        this.getMimeType(this.config.format),
        this.config.quality
      );

      img.src = optimizedDataURL;
      img.dataset.optimized = 'true';
    } catch (error) {
      console.warn('Failed to optimize image:', error);
    }
  }

  // Get loading statistics
  getLoadingStats(): ImageLoadingStats {
    return { ...this.loadingStats };
  }

  // Update configuration
  updateConfig(newConfig: Partial<ImageOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Clear image cache
  clearCache(): void {
    this.imageCache.clear();
    console.log('Image cache cleared');
  }

  // Get cache size
  getCacheSize(): number {
    return this.imageCache.size;
  }

  // Export cache for analysis
  exportCache(): any {
    return {
      size: this.imageCache.size,
      entries: Array.from(this.imageCache.entries()),
      stats: this.loadingStats,
      config: this.config,
      exportedAt: new Date().toISOString()
    };
  }

  // Generate responsive image srcSet
  generateResponsiveSrcSet(
    originalSrc: string,
    sizes: number[]
  ): string {
    return sizes
      .sort((a, b) => a - b)
      .map(size => `${originalSrc}?w=${size} ${size}w`)
      .join(', ');
  }

  // Check if image format is supported
  isFormatSupported(format: string): boolean {
    switch (format) {
      case 'webp':
        return this.checkWebPSupport();
      case 'jpeg':
      case 'png':
        return true;
      default:
        return false;
    }
  }

  // Calculate optimal quality based on image characteristics
  calculateOptimalQuality(
    width: number,
    height: number,
    fileSize: number
  ): number {
    const pixelCount = width * height;
    const bytesPerPixel = fileSize / pixelCount;
    
    // Adjust quality based on image density
    if (bytesPerPixel > 4) {
      return 0.7; // High density, reduce quality more
    } else if (bytesPerPixel > 2) {
      return 0.8; // Medium density
    } else {
      return 0.9; // Low density, maintain quality
    }
  }
}

export const imageOptimizationService = ImageOptimizationService.getInstance();