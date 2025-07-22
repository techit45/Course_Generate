import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { StudySheetContent } from '@/types';

export interface ExportOptions {
  format: 'pdf' | 'web' | 'json';
  includeImages: boolean;
  pageSize: 'A4' | 'Letter' | 'A3';
  orientation: 'portrait' | 'landscape';
  quality: 'low' | 'medium' | 'high';
  watermark?: boolean;
}

export interface ExportProgress {
  step: string;
  progress: number;
  total: number;
  message: string;
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  fileName?: string;
  shareUrl?: string;
  error?: string;
  size?: number;
}

export class ExportService {
  private static instance: ExportService;
  private progressCallback?: (progress: ExportProgress) => void;

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  // Device and browser compatibility checks
  private isDeviceSupported(): boolean {
    if (typeof navigator === 'undefined') return false;
    
    const userAgent = navigator.userAgent.toLowerCase();
    const isOldIOS = /iphone|ipad/.test(userAgent) && /os [1-9]_/.test(userAgent);
    const isOldAndroid = /android/.test(userAgent) && /android [1-4]\./.test(userAgent);
    
    return !isOldIOS && !isOldAndroid;
  }

  // Check if device is mobile
  private isMobileDevice(): boolean {
    if (typeof navigator === 'undefined') return false;
    
    const userAgent = navigator.userAgent.toLowerCase();
    return /mobile|android|iphone|ipad|ipod|blackberry|opera mini|windows phone/i.test(userAgent);
  }

  // Get mobile-optimized options
  private getMobileOptimizedOptions(options: ExportOptions): ExportOptions & { scale?: number } {
    if (!this.isMobileDevice()) return options;

    return {
      ...options,
      quality: options.quality === 'high' ? 'medium' : options.quality, // Reduce quality for mobile
      scale: 1.2 // Lower scale for mobile devices to improve performance
    };
  }

  setProgressCallback(callback: (progress: ExportProgress) => void) {
    this.progressCallback = callback;
  }

  private updateProgress(step: string, progress: number, total: number, message: string) {
    if (this.progressCallback) {
      this.progressCallback({ step, progress, total, message });
    }
  }

  // Generate safe filename for downloads
  generateFileName(content: StudySheetContent, format: string): string {
    const title = content.title || 'ชีทเรียน';
    const timestamp = new Date().toISOString().split('T')[0];
    const grade = content.metadata?.difficultyLevel || '';
    
    // Sanitize title for filename
    const sanitizedTitle = title
      .replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s-_]/g, '') // Keep Thai, English, numbers, spaces, hyphens, underscores
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .slice(0, 50); // Limit length

    return `${sanitizedTitle}${grade ? `-${grade}` : ''}-${timestamp}.${format}`;
  }

  // Export as PDF
  async exportToPDF(
    content: StudySheetContent, 
    element: HTMLElement, 
    options: ExportOptions = {
      format: 'pdf',
      includeImages: true,
      pageSize: 'A4',
      orientation: 'portrait',
      quality: 'medium',
      watermark: true
    }
  ): Promise<ExportResult> {
    try {
      // Check device support
      if (!this.isDeviceSupported()) {
        throw new Error('อุปกรณ์นี้ไม่รองรับการสร้าง PDF กรุณาใช้เบราว์เซอร์ที่ทันสมัยกว่า');
      }

      this.updateProgress('preparing', 0, 5, 'กำลังเตรียมข้อมูลสำหรับการสร้าง PDF...');

      // Get mobile-optimized options
      const optimizedOptions = this.getMobileOptimizedOptions(options);

      // Create PDF document
      const pdf = new jsPDF({
        orientation: optimizedOptions.orientation,
        unit: 'mm',
        format: optimizedOptions.pageSize.toLowerCase() as any,
        compress: optimizedOptions.quality !== 'high'
      });

      this.updateProgress('capturing', 1, 5, 
        this.isMobileDevice() 
          ? 'กำลังจับภาพเนื้อหา (โหมดมือถือ)...'
          : 'กำลังจับภาพเนื้อหา...'
      );

      // Configure html2canvas options with mobile optimization
      const scale = (optimizedOptions as any).scale || 
        (optimizedOptions.quality === 'high' ? 2 : optimizedOptions.quality === 'medium' ? 1.5 : 1);

      const canvasOptions = {
        scale,
        useCORS: true,
        allowTaint: false, // More restrictive for mobile
        backgroundColor: '#ffffff',
        width: optimizedOptions.pageSize === 'A4' ? 794 : optimizedOptions.pageSize === 'Letter' ? 816 : 1123,
        height: optimizedOptions.pageSize === 'A4' ? 1123 : optimizedOptions.pageSize === 'Letter' ? 1056 : 1587,
        // Mobile-specific optimizations
        ...(this.isMobileDevice() && {
          logging: false, // Reduce console output on mobile
          removeContainer: true, // Clean up after capture
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight
        })
      };

      // Capture the element as canvas
      const canvas = await html2canvas(element, canvasOptions);
      
      this.updateProgress('converting', 2, 5, 'กำลังแปลงเป็น PDF...');

      // Get PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image to PDF with proper scaling
      if (imgHeight <= pdfHeight) {
        // Single page
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.8), 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        // Multiple pages
        let currentHeight = 0;
        const pageHeight = pdfHeight;
        let pageNumber = 1;

        while (currentHeight < imgHeight) {
          if (pageNumber > 1) {
            pdf.addPage();
          }

          const sourceY = (currentHeight * canvas.height) / imgHeight;
          const sourceHeight = Math.min(
            (pageHeight * canvas.height) / imgHeight,
            canvas.height - sourceY
          );

          // Create temporary canvas for this page section
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          const tempCtx = tempCanvas.getContext('2d');
          
          if (tempCtx) {
            tempCtx.drawImage(
              canvas,
              0, sourceY, canvas.width, sourceHeight,
              0, 0, canvas.width, sourceHeight
            );
            
            const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;
            pdf.addImage(
              tempCanvas.toDataURL('image/jpeg', 0.8),
              'JPEG',
              0,
              0,
              imgWidth,
              pageImgHeight
            );
          }

          currentHeight += pageHeight;
          pageNumber++;
        }
      }

      this.updateProgress('metadata', 3, 5, 'กำลังเพิ่มข้อมูลเมตะ...');

      // Add metadata
      pdf.setProperties({
        title: content.title,
        subject: 'ชีทเรียนจาก GenCouce - Login-Learning',
        author: 'Login-Learning AI System',
        creator: 'GenCouce Study Sheet Generator',
        producer: 'Login-Learning Platform'
      });

      // Add Login-Learning branding if requested
      if (options.watermark) {
        this.addLoginLearningBranding(pdf, pdfWidth, pdfHeight, content);
      }

      this.updateProgress('finalizing', 4, 5, 'กำลังสร้างไฟล์ PDF...');

      // Generate filename
      const fileName = this.generateFileName(content, 'pdf');
      
      // Save PDF
      const pdfBlob = pdf.output('blob');
      const downloadUrl = URL.createObjectURL(pdfBlob);

      this.updateProgress('complete', 5, 5, 'การสร้าง PDF เสร็จสมบูรณ์!');

      return {
        success: true,
        downloadUrl,
        fileName,
        size: pdfBlob.size
      };

    } catch (error) {
      console.error('PDF export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้าง PDF'
      };
    }
  }

  // Add Login-Learning branding to PDF
  private addLoginLearningBranding(pdf: jsPDF, width: number, height: number, content: StudySheetContent) {
    // Add header branding
    this.addBrandingHeader(pdf, width);
    
    // Add footer branding  
    this.addBrandingFooter(pdf, width, height);
    
    // Add subtle watermark
    this.addBrandingWatermark(pdf, width, height);
  }

  private addBrandingHeader(pdf: jsPDF, width: number) {
    const headerHeight = 15;
    const margin = 10;
    
    // Add branded header background
    pdf.setFillColor(37, 99, 235); // Login-Learning blue
    pdf.rect(0, 0, width, headerHeight, 'F');
    
    // Add logo placeholder (simplified text logo)
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LOGIN-LEARNING', margin, 8);
    
    // Add subtitle
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Study Sheet Generator', margin, 12);
    
    // Add generated timestamp
    const timestamp = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timestampWidth = pdf.getTextWidth(`Generated: ${timestamp}`);
    pdf.text(`Generated: ${timestamp}`, width - margin - timestampWidth, 8);
  }

  private addBrandingFooter(pdf: jsPDF, width: number, height: number) {
    const footerHeight = 12;
    const margin = 10;
    const footerY = height - footerHeight;
    
    // Add branded footer background
    pdf.setFillColor(30, 64, 175); // Darker Login-Learning blue
    pdf.rect(0, footerY, width, footerHeight, 'F');
    
    // Add copyright text
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    const currentYear = new Date().getFullYear();
    pdf.text(`© ${currentYear} Login-Learning Co., Ltd. | Powered by AI Technology`, margin, footerY + 6);
    
    // Add website
    const websiteText = 'www.login-learning.com';
    const websiteWidth = pdf.getTextWidth(websiteText);
    pdf.text(websiteText, width - margin - websiteWidth, footerY + 6);
    
    // Add page numbers if multiple pages
    const totalPages = pdf.internal.getNumberOfPages();
    if (totalPages > 1) {
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        const pageText = `Page ${i} of ${totalPages}`;
        const pageTextWidth = pdf.getTextWidth(pageText);
        pdf.text(pageText, width - margin - pageTextWidth, footerY + 9);
      }
    }
  }

  private addBrandingWatermark(pdf: jsPDF, width: number, height: number) {
    const fontSize = Math.min(width, height) * 0.025;
    pdf.setFontSize(fontSize);
    pdf.setTextColor(59, 130, 246, 0.08); // Very light blue
    pdf.setFont('helvetica', 'normal');
    
    // TODO: Fix watermark functionality with correct jsPDF API
    // Add diagonal watermark
    // const text = 'LOGIN-LEARNING GENCOUCE';
    // const textWidth = pdf.getTextWidth(text);
    // 
    // // Calculate position for center diagonal
    // const centerX = width / 2;
    // const centerY = height / 2;
    // const angle = -45;
    // 
    // pdf.saveGraphicsState();
    // pdf.setGState(new pdf.GState({ opacity: 0.05 }));
    // 
    // // Multiple diagonal watermarks for better coverage
    // for (let y = -height; y < height * 2; y += 80) {
    //   for (let x = -width; x < width * 2; x += 120) {
    //     pdf.text(text, x, y, {
    //       angle: angle,
    //       align: 'center'
    //     });
    //   }
    // }
    // 
    // pdf.restoreGraphicsState();
  }

  // Export for web sharing
  async exportToWeb(content: StudySheetContent): Promise<ExportResult> {
    try {
      this.updateProgress('preparing', 0, 3, 'กำลังเตรียมข้อมูลสำหรับการแชร์...');

      // Create shareable JSON data
      const shareData = {
        id: `sheet-${Date.now()}`,
        title: content.title,
        content: content,
        generatedAt: new Date().toISOString(),
        platform: 'GenCouce Login-Learning',
        version: '1.0'
      };

      this.updateProgress('uploading', 1, 3, 'กำลังอัพโหลดข้อมูล...');

      // In a real implementation, this would upload to a sharing service
      // For now, we'll create a downloadable JSON file
      const dataBlob = new Blob([JSON.stringify(shareData, null, 2)], {
        type: 'application/json'
      });
      
      const fileName = this.generateFileName(content, 'json');
      const downloadUrl = URL.createObjectURL(dataBlob);

      // Generate a mock share URL (in production, this would be a real sharing URL)
      const shareUrl = `https://gencouce.login-learning.com/share/${shareData.id}`;

      this.updateProgress('complete', 3, 3, 'การเตรียมข้อมูลสำหรับแชร์เสร็จสมบูรณ์!');

      return {
        success: true,
        downloadUrl,
        fileName,
        shareUrl,
        size: dataBlob.size
      };

    } catch (error) {
      console.error('Web export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเตรียมข้อมูลแชร์'
      };
    }
  }

  // Export as JSON (backup format)
  async exportToJSON(content: StudySheetContent): Promise<ExportResult> {
    try {
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        content: content,
        metadata: {
          generator: 'GenCouce Study Sheet Generator',
          platform: 'Login-Learning',
          format: 'StudySheetContent'
        }
      };

      const dataBlob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const fileName = this.generateFileName(content, 'json');
      const downloadUrl = URL.createObjectURL(dataBlob);

      return {
        success: true,
        downloadUrl,
        fileName,
        size: dataBlob.size
      };

    } catch (error) {
      console.error('JSON export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างไฟล์ JSON'
      };
    }
  }

  // Trigger download
  downloadFile(url: string, fileName: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL after download
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }

  // Copy share URL to clipboard
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const exportService = ExportService.getInstance();