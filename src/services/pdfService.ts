import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  PDFGenerationRequest,
  PDFGenerationResponse,
  PDFOptions,
  BrandingOptions,
  PDFTemplate,
  StudySheetContent,
  ContentSection,
  Exercise,
  Activity,
  GradeLevel,
  PDFExportProgress,
  ImageData,
  AnimationData
} from '@/types';
import {
  DEFAULT_STUDY_SHEET_TEMPLATE,
  LOGIN_LEARNING_BRANDING,
  DEFAULT_PDF_OPTIONS,
  getTemplateByContentAmount,
  GRADE_PDF_SETTINGS,
  TEXT_STYLES
} from '@/config/pdfTemplates';

// PDF Generation Service
export class PDFGenerationService {
  private doc: jsPDF;
  private currentY: number = 0;
  private pageNumber: number = 1;
  private template: PDFTemplate;
  private options: PDFOptions;
  private branding: BrandingOptions;
  private gradeSettings: any;
  private progressCallback?: (progress: PDFExportProgress) => void;

  constructor(
    template: PDFTemplate = DEFAULT_STUDY_SHEET_TEMPLATE,
    options: PDFOptions = DEFAULT_PDF_OPTIONS,
    branding: BrandingOptions = LOGIN_LEARNING_BRANDING
  ) {
    this.template = template;
    this.options = options;
    this.branding = branding;
    
    // Initialize jsPDF with options
    this.doc = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.format.toLowerCase() as any,
      putOnlyUsedFonts: true,
      floatPrecision: 2
    });

    this.currentY = options.margins.top;
  }

  // Main PDF generation method
  public async generatePDF(
    request: PDFGenerationRequest,
    progressCallback?: (progress: PDFExportProgress) => void
  ): Promise<PDFGenerationResponse> {
    const startTime = Date.now();
    this.progressCallback = progressCallback;

    try {
      this.updateProgress('preparing', 0, 'เตรียมการสร้าง PDF');

      // Set up grade-specific settings
      const gradeLevel = this.extractGradeLevel(request.studySheetContent);
      this.gradeSettings = GRADE_PDF_SETTINGS[gradeLevel];

      // Select appropriate template
      const contentAmount = this.determineContentAmount(request.studySheetContent);
      this.template = getTemplateByContentAmount(contentAmount);

      this.updateProgress('generating-content', 10, 'กำลังสร้างเนื้อหา');

      // Generate PDF sections
      await this.generateCoverPage(request.studySheetContent);
      this.updateProgress('generating-content', 20, 'สร้างหน้าปก');

      if (this.options.tableOfContents) {
        await this.generateTableOfContents(request.studySheetContent);
        this.updateProgress('generating-content', 30, 'สร้างสารบัญ');
      }

      await this.generateObjectives(request.studySheetContent);
      this.updateProgress('generating-content', 40, 'สร้างวัตถุประสงค์');

      await this.generateMainContent(request.studySheetContent);
      this.updateProgress('adding-images', 50, 'เพิ่มเนื้อหาหลัก');

      await this.generateActivities(request.studySheetContent);
      this.updateProgress('adding-images', 60, 'เพิ่มกิจกรรม');

      await this.generateExercises(request.studySheetContent);
      this.updateProgress('formatting', 70, 'สร้างแบบฝึกหัด');

      await this.generateSummary(request.studySheetContent);
      this.updateProgress('formatting', 80, 'สร้างสรุป');

      await this.generateNotePages();
      this.updateProgress('finalizing', 90, 'เพิ่มหน้าจดบันทึก');

      // Add headers and footers
      if (this.options.headerFooter) {
        this.addHeadersAndFooters();
      }

      // Add page numbers
      if (this.options.pageNumbers) {
        this.addPageNumbers();
      }

      this.updateProgress('complete', 100, 'เสร็จสิ้น');

      const pdfBlob = this.doc.output('blob');
      const filename = this.generateFilename(request.studySheetContent);

      return {
        success: true,
        pdfBlob,
        filename,
        pageCount: this.pageNumber,
        fileSize: pdfBlob.size,
        generationTime: Date.now() - startTime,
        warnings: []
      };

    } catch (error) {
      console.error('PDF generation error:', error);
      return {
        success: false,
        filename: 'error.pdf',
        pageCount: 0,
        fileSize: 0,
        generationTime: Date.now() - startTime,
        error: `เกิดข้อผิดพลาดในการสร้าง PDF: ${error}`
      };
    }
  }

  // Cover Page Generation
  private async generateCoverPage(content: StudySheetContent): Promise<void> {
    this.addNewPage();
    
    // Add logo/branding
    this.currentY = 40;
    
    // Company name
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(this.branding.primaryColor);
    this.addCenteredText(this.branding.companyName, this.currentY);
    this.currentY += 20;

    // Main title
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(24);
    this.doc.setTextColor('#000000');
    this.addCenteredText(content.title, this.currentY);
    this.currentY += 30;

    // Grade level and metadata
    if (content.metadata) {
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(14);
      this.doc.setTextColor('#666666');
      
      const metadataLines = [
        `ระดับชั้น: ${content.metadata.difficultyLevel}`,
        `จำนวนหน้า: ${content.metadata.pageCount} หน้า`,
        `ระยะเวลา: ${Math.floor(content.metadata.totalDuration / 60)} ชั่วโมง ${content.metadata.totalDuration % 60} นาที`,
        `จำนวนกิจกรรม: ${content.metadata.activityCount} กิจกรรม`,
        `จำนวนแบบฝึกหัด: ${content.metadata.exerciseCount} ข้อ`
      ];

      metadataLines.forEach(line => {
        this.addCenteredText(line, this.currentY);
        this.currentY += 12;
      });
    }

    // Add decorative border
    this.addDecorativeBorder();

    // Footer with generation date
    this.currentY = this.doc.internal.pageSize.height - 40;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor('#999999');
    this.addCenteredText(`สร้างเมื่อ: ${new Date().toLocaleDateString('th-TH')}`, this.currentY);
  }

  // Table of Contents Generation
  private async generateTableOfContents(content: StudySheetContent): Promise<void> {
    this.addNewPage();
    this.addSectionTitle('สารบัญ');

    const tocItems = [
      { title: 'วัตถุประสงค์การเรียนรู้', page: 3 },
      { title: 'เนื้อหาหลัก', page: 4 },
      { title: 'กิจกรรมการเรียนรู้', page: Math.ceil(content.mainContent.length / 2) + 4 },
      { title: 'แบบฝึกหัด', page: Math.ceil(content.mainContent.length / 2) + content.activities.length + 5 },
      { title: 'สรุป', page: Math.ceil(content.mainContent.length / 2) + content.activities.length + Math.ceil(content.exercises.length / 5) + 6 },
      { title: 'หน้าจดบันทึก', page: Math.ceil(content.mainContent.length / 2) + content.activities.length + Math.ceil(content.exercises.length / 5) + 7 }
    ];

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.setTextColor('#000000');

    tocItems.forEach(item => {
      const pageWidth = this.doc.internal.pageSize.width;
      const leftMargin = this.options.margins.left;
      const rightMargin = this.options.margins.right;
      const availableWidth = pageWidth - leftMargin - rightMargin;

      // Title
      this.doc.text(item.title, leftMargin, this.currentY);
      
      // Dotted line
      const dots = '.'.repeat(Math.floor((availableWidth - this.doc.getTextWidth(item.title) - this.doc.getTextWidth(item.page.toString())) / 2));
      this.doc.text(dots, leftMargin + this.doc.getTextWidth(item.title) + 2, this.currentY);
      
      // Page number
      this.doc.text(item.page.toString(), pageWidth - rightMargin - this.doc.getTextWidth(item.page.toString()), this.currentY);
      
      this.currentY += 8;
    });
  }

  // Objectives Generation
  private async generateObjectives(content: StudySheetContent): Promise<void> {
    if (this.shouldStartNewPage()) {
      this.addNewPage();
    }

    this.addSectionTitle('วัตถุประสงค์การเรียนรู้');

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor('#000000');

    content.objectives.forEach((objective, index) => {
      const bullet = `${index + 1}.`;
      const leftMargin = this.options.margins.left;
      
      // Add bullet point
      this.doc.text(bullet, leftMargin, this.currentY);
      
      // Add objective text with proper wrapping
      const maxWidth = this.doc.internal.pageSize.width - this.options.margins.left - this.options.margins.right - 10;
      const lines = this.doc.splitTextToSize(objective, maxWidth);
      
      lines.forEach((line: string, lineIndex: number) => {
        const xPos = lineIndex === 0 ? leftMargin + 8 : leftMargin + 8;
        this.doc.text(line, xPos, this.currentY);
        this.currentY += 6;
      });
      
      this.currentY += 4; // Extra space between objectives
    });

    this.currentY += 10; // Space after objectives section
  }

  // Main Content Generation
  private async generateMainContent(content: StudySheetContent): Promise<void> {
    for (const section of content.mainContent) {
      if (this.shouldStartNewPage()) {
        this.addNewPage();
      }

      await this.generateContentSection(section);
    }
  }

  // Individual Content Section
  private async generateContentSection(section: ContentSection): Promise<void> {
    // Section title
    this.addSubsectionTitle(section.title);

    // Section content
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor('#000000');

    const maxWidth = this.doc.internal.pageSize.width - this.options.margins.left - this.options.margins.right;
    const lines = this.doc.splitTextToSize(section.content, maxWidth);
    
    lines.forEach((line: string) => {
      if (this.shouldStartNewPage()) {
        this.addNewPage();
      }
      this.doc.text(line, this.options.margins.left, this.currentY);
      this.currentY += 6;
    });

    // Add images if present
    if (this.options.includeImages && section.images && section.images.length > 0) {
      await this.addSectionImages(section.images);
    }

    // Add diagrams if present
    if (this.options.includeDiagrams && section.animations && section.animations.length > 0) {
      await this.addSectionDiagrams(section.animations);
    }

    // Add note space if enabled
    if (section.noteSpace) {
      this.addNoteSpace(this.gradeSettings.noteSpaceHeight);
    }

    this.currentY += 12; // Space between sections
  }

  // Activities Generation
  private async generateActivities(content: StudySheetContent): Promise<void> {
    if (content.activities.length === 0) return;

    this.addNewPage();
    this.addSectionTitle('กิจกรรมการเรียนรู้');

    content.activities.forEach((activity, index) => {
      if (this.shouldStartNewPage()) {
        this.addNewPage();
      }

      this.generateActivity(activity, index + 1);
    });
  }

  // Individual Activity
  private generateActivity(activity: Activity, number: number): void {
    // Activity title
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.setTextColor(this.branding.primaryColor);
    this.doc.text(`กิจกรรมที่ ${number}: ${activity.title}`, this.options.margins.left, this.currentY);
    this.currentY += 10;

    // Activity details
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor('#666666');
    
    const details = [
      `ระยะเวลา: ${activity.duration} นาที`,
      `ประเภท: ${this.getActivityTypeInThai(activity.type)}`,
      `วัสดุอุปกรณ์: ${activity.materials.join(', ')}`
    ];

    details.forEach(detail => {
      this.doc.text(detail, this.options.margins.left, this.currentY);
      this.currentY += 5;
    });

    this.currentY += 5;

    // Activity description
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor('#000000');
    
    const maxWidth = this.doc.internal.pageSize.width - this.options.margins.left - this.options.margins.right;
    const descLines = this.doc.splitTextToSize(activity.description, maxWidth);
    
    descLines.forEach((line: string) => {
      this.doc.text(line, this.options.margins.left, this.currentY);
      this.currentY += 6;
    });

    // Instructions
    if (activity.instructions.length > 0) {
      this.currentY += 5;
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(10);
      this.doc.text('ขั้นตอนการทำกิจกรรม:', this.options.margins.left, this.currentY);
      this.currentY += 7;

      this.doc.setFont('helvetica', 'normal');
      activity.instructions.forEach((instruction, index) => {
        const bullet = `${index + 1}.`;
        this.doc.text(bullet, this.options.margins.left, this.currentY);
        
        const instrLines = this.doc.splitTextToSize(instruction, maxWidth - 10);
        instrLines.forEach((line: string, lineIndex: number) => {
          const xPos = lineIndex === 0 ? this.options.margins.left + 8 : this.options.margins.left + 8;
          this.doc.text(line, xPos, this.currentY);
          this.currentY += 5;
        });
      });
    }

    this.currentY += 15; // Space between activities
  }

  // Exercises Generation
  private async generateExercises(content: StudySheetContent): Promise<void> {
    if (content.exercises.length === 0) return;

    this.addNewPage();
    this.addSectionTitle('แบบฝึกหัด');

    content.exercises.forEach((exercise, index) => {
      if (this.shouldStartNewPage()) {
        this.addNewPage();
      }

      this.generateExercise(exercise, index + 1);
    });
  }

  // Individual Exercise
  private generateExercise(exercise: Exercise, number: number): void {
    // Exercise question
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor('#000000');

    const questionText = `${number}. ${exercise.question}`;
    const maxWidth = this.doc.internal.pageSize.width - this.options.margins.left - this.options.margins.right;
    const questionLines = this.doc.splitTextToSize(questionText, maxWidth);
    
    questionLines.forEach((line: string) => {
      this.doc.text(line, this.options.margins.left, this.currentY);
      this.currentY += 6;
    });

    // Multiple choice options
    if (exercise.type === 'multiple-choice' && exercise.options) {
      this.currentY += 3;
      exercise.options.forEach((option, index) => {
        const optionLetter = String.fromCharCode(97 + index); // a, b, c, d
        this.doc.text(`${optionLetter}) ${option}`, this.options.margins.left + 10, this.currentY);
        this.currentY += 6;
      });
    }

    // Answer space
    this.addAnswerSpace(exercise.answerSpace);

    this.currentY += 8; // Space between exercises
  }

  // Summary Generation
  private async generateSummary(content: StudySheetContent): Promise<void> {
    if (this.shouldStartNewPage()) {
      this.addNewPage();
    }

    this.addSectionTitle('สรุป');

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor('#000000');

    const maxWidth = this.doc.internal.pageSize.width - this.options.margins.left - this.options.margins.right;
    const lines = this.doc.splitTextToSize(content.summary, maxWidth);
    
    lines.forEach((line: string) => {
      if (this.shouldStartNewPage()) {
        this.addNewPage();
      }
      this.doc.text(line, this.options.margins.left, this.currentY);
      this.currentY += 6;
    });
  }

  // Note Pages Generation
  private async generateNotePages(): Promise<void> {
    const notePageCount = this.calculateRequiredNotePages();
    
    for (let i = 0; i < notePageCount; i++) {
      this.addNewPage();
      this.addSectionTitle(`หน้าจดบันทึก ${i + 1}`);
      this.addFullPageNoteSpace();
    }
  }

  // Helper Methods
  private addNewPage(): void {
    if (this.pageNumber > 1) {
      this.doc.addPage();
    }
    this.pageNumber++;
    this.currentY = this.options.margins.top;
  }

  private shouldStartNewPage(): boolean {
    const remainingSpace = this.doc.internal.pageSize.height - this.currentY - this.options.margins.bottom;
    return remainingSpace < 40; // If less than 40mm remaining
  }

  private addSectionTitle(title: string): void {
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(this.branding.primaryColor);
    this.doc.text(title, this.options.margins.left, this.currentY);
    this.currentY += 15;
  }

  private addSubsectionTitle(title: string): void {
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(13);
    this.doc.setTextColor('#333333');
    this.doc.text(title, this.options.margins.left, this.currentY);
    this.currentY += 10;
  }

  private addCenteredText(text: string, y: number): void {
    const pageWidth = this.doc.internal.pageSize.width;
    const textWidth = this.doc.getTextWidth(text);
    const x = (pageWidth - textWidth) / 2;
    this.doc.text(text, x, y);
  }

  private addNoteSpace(height: number): void {
    const startY = this.currentY;
    const endY = startY + height;
    const leftMargin = this.options.margins.left;
    const rightMargin = this.doc.internal.pageSize.width - this.options.margins.right;

    // Draw note lines
    for (let y = startY + 8; y <= endY; y += 8) {
      this.doc.setDrawColor('#CCCCCC');
      this.doc.setLineWidth(0.1);
      this.doc.line(leftMargin, y, rightMargin, y);
    }

    this.currentY = endY + 5;
  }

  private addFullPageNoteSpace(): void {
    const availableHeight = this.doc.internal.pageSize.height - this.currentY - this.options.margins.bottom - 10;
    this.addNoteSpace(availableHeight);
  }

  private addAnswerSpace(lines: number): void {
    const lineHeight = 8;
    const totalHeight = lines * lineHeight;
    this.addNoteSpace(totalHeight);
  }

  private addDecorativeBorder(): void {
    const pageWidth = this.doc.internal.pageSize.width;
    const pageHeight = this.doc.internal.pageSize.height;
    const margin = 10;

    this.doc.setDrawColor(this.branding.primaryColor);
    this.doc.setLineWidth(1);
    this.doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
  }

  private addHeadersAndFooters(): void {
    const totalPages = this.pageNumber;
    
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      
      // Skip header/footer on cover page
      if (i === 1) continue;

      // Header
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.setTextColor('#666666');
      this.doc.text(this.branding.companyName, this.options.margins.left, 10);

      // Footer
      if (this.branding.footerText) {
        const pageWidth = this.doc.internal.pageSize.width;
        const footerY = this.doc.internal.pageSize.height - 10;
        this.addCenteredText(this.branding.footerText, footerY);
      }
    }
  }

  private addPageNumbers(): void {
    const totalPages = this.pageNumber;
    
    for (let i = 2; i <= totalPages; i++) { // Skip page numbering on cover page
      this.doc.setPage(i);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.setTextColor('#666666');
      
      const pageWidth = this.doc.internal.pageSize.width;
      const pageText = `${i - 1}`;
      const textWidth = this.doc.getTextWidth(pageText);
      this.doc.text(pageText, pageWidth - this.options.margins.right - textWidth, this.doc.internal.pageSize.height - 10);
    }
  }

  private async addSectionImages(images: ImageData[]): Promise<void> {
    // For now, add placeholder for images
    // In a full implementation, you would convert images to base64 and add them
    images.forEach(image => {
      if (this.shouldStartNewPage()) {
        this.addNewPage();
      }

      // Add image placeholder
      this.doc.setDrawColor('#CCCCCC');
      this.doc.setFillColor('#F5F5F5');
      this.doc.rect(this.options.margins.left, this.currentY, 60, 40, 'FD');
      
      // Add image caption
      this.doc.setFont('helvetica', 'italic');
      this.doc.setFontSize(9);
      this.doc.setTextColor('#666666');
      this.doc.text(`ภาพ: ${image.caption || image.alt}`, this.options.margins.left, this.currentY + 45);
      
      this.currentY += 55;
    });
  }

  private async addSectionDiagrams(diagrams: AnimationData[]): Promise<void> {
    // Add diagram placeholders
    diagrams.forEach(diagram => {
      if (this.shouldStartNewPage()) {
        this.addNewPage();
      }

      // Add diagram placeholder
      this.doc.setDrawColor('#1E40AF');
      this.doc.setFillColor('#EBF4FF');
      this.doc.rect(this.options.margins.left, this.currentY, 80, 50, 'FD');
      
      // Add diagram title
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(10);
      this.doc.setTextColor('#1E40AF');
      this.doc.text(diagram.title, this.options.margins.left, this.currentY + 55);
      
      this.currentY += 65;
    });
  }

  private calculateRequiredNotePages(): number {
    // Calculate based on content amount - aim for 30-40 total pages
    const contentPages = this.pageNumber;
    const targetTotalPages = 35; // Target 35 pages
    const requiredNotePages = Math.max(5, targetTotalPages - contentPages);
    return Math.min(requiredNotePages, 15); // Max 15 note pages
  }

  private extractGradeLevel(content: StudySheetContent): GradeLevel {
    return content.metadata?.difficultyLevel || 'ม.3';
  }

  private determineContentAmount(content: StudySheetContent): 'น้อย' | 'ปานกลาง' | 'มาก' {
    const totalSections = content.mainContent.length;
    if (totalSections <= 4) return 'น้อย';
    if (totalSections <= 6) return 'ปานกลาง';
    return 'มาก';
  }

  private getActivityTypeInThai(type: Activity['type']): string {
    const typeMap = {
      'individual': 'รายบุคคล',
      'group': 'กลุ่ม',
      'demonstration': 'สาธิต',
      'discussion': 'อภิปราย'
    };
    return typeMap[type] || type;
  }

  private generateFilename(content: StudySheetContent): string {
    const title = content.title.replace(/[^a-zA-Z0-9ก-๙]/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const grade = content.metadata?.difficultyLevel || 'Unknown';
    return `StudySheet_${title}_${grade}_${date}.pdf`;
  }

  private updateProgress(
    stage: PDFExportProgress['stage'], 
    progress: number, 
    currentSection?: string
  ): void {
    if (this.progressCallback) {
      this.progressCallback({
        stage,
        progress,
        currentSection
      });
    }
  }
}

// Utility functions for PDF generation
export const generateStudySheetPDF = async (
  content: StudySheetContent,
  options: Partial<PDFOptions> = {},
  branding: Partial<BrandingOptions> = {},
  progressCallback?: (progress: PDFExportProgress) => void
): Promise<PDFGenerationResponse> => {
  const finalOptions: PDFOptions = { ...DEFAULT_PDF_OPTIONS, ...options };
  const finalBranding: BrandingOptions = { ...LOGIN_LEARNING_BRANDING, ...branding };
  
  // Select template based on content
  const contentAmount = content.mainContent.length <= 4 ? 'น้อย' : 
                      content.mainContent.length <= 6 ? 'ปานกลาง' : 'มาก';
  const template = getTemplateByContentAmount(contentAmount);

  const pdfService = new PDFGenerationService(template, finalOptions, finalBranding);
  
  const request: PDFGenerationRequest = {
    studySheetContent: content,
    options: finalOptions,
    branding: finalBranding
  };

  return await pdfService.generatePDF(request, progressCallback);
};

export default PDFGenerationService;