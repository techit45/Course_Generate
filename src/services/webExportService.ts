import {
  WebExportRequest,
  WebExportResponse,
  WebExportOptions,
  WebThemeOptions,
  StudySheetContent,
  ContentSection,
  Exercise,
  Activity,
  ImageData,
  AnimationData,
  WebLayoutSection,
  InteractiveFeature,
  WebAnimation
} from '@/types';
import {
  LOGIN_LEARNING_WEB_THEME,
  DEFAULT_WEB_OPTIONS,
  WEB_LAYOUT_SECTIONS,
  INTERACTIVE_FEATURES,
  WEB_ANIMATIONS,
  WEB_CSS_TEMPLATE,
  WEB_JS_TEMPLATE
} from '@/config/webTemplates';

// Web Export Service
export class WebExportService {
  private options: WebExportOptions;
  private theme: WebThemeOptions;
  private sections: WebLayoutSection[];
  private interactiveFeatures: InteractiveFeature[];
  private animations: WebAnimation[];

  constructor(
    options: WebExportOptions = DEFAULT_WEB_OPTIONS,
    theme: WebThemeOptions = LOGIN_LEARNING_WEB_THEME
  ) {
    this.options = options;
    this.theme = theme;
    this.sections = [...WEB_LAYOUT_SECTIONS];
    this.interactiveFeatures = [...INTERACTIVE_FEATURES];
    this.animations = [...WEB_ANIMATIONS];
  }

  // Main web export method
  public async exportToWeb(request: WebExportRequest): Promise<WebExportResponse> {
    const startTime = Date.now();

    try {
      // Generate HTML structure
      const htmlContent = this.generateHTML(request.studySheetContent);
      
      // Generate CSS with theme variables
      const cssContent = this.generateCSS();
      
      // Generate JavaScript for interactivity
      const jsContent = this.generateJavaScript();
      
      // Create complete web page
      const completeHTML = this.assembleCompletePage(
        request.studySheetContent,
        htmlContent,
        cssContent,
        jsContent
      );

      return {
        success: true,
        htmlContent: completeHTML,
        cssContent,
        jsContent,
        exportTime: Date.now() - startTime,
        warnings: []
      };

    } catch (error) {
      console.error('Web export error:', error);
      return {
        success: false,
        exportTime: Date.now() - startTime,
        error: `เกิดข้อผิดพลาดในการสร้างเว็บไซต์: ${error}`
      };
    }
  }

  // Generate HTML structure
  private generateHTML(content: StudySheetContent): string {
    const visibleSections = this.sections
      .filter(section => section.visible)
      .sort((a, b) => a.order - b.order);

    let html = '';

    visibleSections.forEach(section => {
      switch (section.type) {
        case 'hero':
          html += this.generateHeroSection(content);
          break;
        case 'objectives':
          html += this.generateObjectivesSection(content);
          break;
        case 'content':
          html += this.generateContentSection(content);
          break;
        case 'activities':
          html += this.generateActivitiesSection(content);
          break;
        case 'exercises':
          html += this.generateExercisesSection(content);
          break;
        case 'summary':
          html += this.generateSummarySection(content);
          break;
        case 'footer':
          html += this.generateFooterSection();
          break;
      }
    });

    return html;
  }

  // Generate Hero Section
  private generateHeroSection(content: StudySheetContent): string {
    return `
    <section id="hero" class="hero-section">
      <div class="container">
        <h1 class="hero-title">${content.title}</h1>
        <p class="hero-subtitle">แผ่นงานการเรียนรู้ที่ออกแบบเฉพาะสำหรับคุณ</p>
        
        ${content.metadata ? `
        <div class="hero-metadata">
          <div class="metadata-item">
            <span>📚</span>
            <span>ระดับชั้น ${content.metadata.difficultyLevel}</span>
          </div>
          <div class="metadata-item">
            <span>📄</span>
            <span>${content.metadata.pageCount} หน้า</span>
          </div>
          <div class="metadata-item">
            <span>⏱️</span>
            <span>${Math.floor(content.metadata.totalDuration / 60)} ชั่วโมง ${content.metadata.totalDuration % 60} นาที</span>
          </div>
          <div class="metadata-item">
            <span>🎯</span>
            <span>${content.metadata.activityCount} กิจกรรม</span>
          </div>
          <div class="metadata-item">
            <span>📝</span>
            <span>${content.metadata.exerciseCount} แบบฝึกหัด</span>
          </div>
        </div>
        ` : ''}
      </div>
    </section>`;
  }

  // Generate Navigation
  private generateNavigation(): string {
    const navItems = this.sections
      .filter(section => section.visible && section.type !== 'hero' && section.type !== 'footer')
      .sort((a, b) => a.order - b.order);

    return `
    <nav class="navigation">
      <div class="container">
        <ul class="nav-links">
          ${navItems.map(section => `
            <li>
              <a href="#${section.id}" class="nav-link">${section.title}</a>
            </li>
          `).join('')}
        </ul>
      </div>
    </nav>`;
  }

  // Generate Objectives Section
  private generateObjectivesSection(content: StudySheetContent): string {
    return `
    <section id="objectives" class="content-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">วัตถุประสงค์การเรียนรู้</h2>
        </div>
        
        <div class="objectives-grid">
          ${content.objectives.map((objective, index) => `
            <div class="objective-item interactive-card" data-tooltip="คลิกเพื่อดูรายละเอียดเพิ่มเติม">
              <div class="objective-number">${index + 1}</div>
              <div class="objective-content">
                <p>${objective}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`;
  }

  // Generate Main Content Section
  private generateContentSection(content: StudySheetContent): string {
    return `
    <section id="content" class="content-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">เนื้อหาหลัก</h2>
        </div>
        
        <div class="content-grid">
          ${content.mainContent.map((section, index) => this.generateContentItem(section, index)).join('')}
        </div>
      </div>
    </section>`;
  }

  // Generate individual content item
  private generateContentItem(section: ContentSection, index: number): string {
    const sectionTypeText = {
      'theory': 'ทฤษฎี',
      'example': 'ตัวอย่าง',
      'explanation': 'อธิบาย',
      'practice': 'ฝึกปฏิบัติ',
      'summary': 'สรุป'
    };

    return `
    <div class="content-item">
      <div class="content-header content-section-header">
        <h3>${index + 1}. ${section.title}</h3>
        <div class="content-meta">
          <span class="content-type">${sectionTypeText[section.type] || section.type}</span>
          ${section.duration ? `<span class="content-duration">⏱️ ${section.duration} นาที</span>` : ''}
          <span class="expand-icon">▼</span>
        </div>
      </div>
      
      <div class="content-body">
        <p class="content-text">${section.content}</p>
        
        ${section.images && section.images.length > 0 ? `
          <div class="content-images">
            ${section.images.map(image => this.generateImageElement(image)).join('')}
          </div>
        ` : ''}
        
        ${section.animations && section.animations.length > 0 ? `
          <div class="content-diagrams">
            ${section.animations.map(animation => this.generateDiagramElement(animation)).join('')}
          </div>
        ` : ''}
        
        ${section.keyTerms && section.keyTerms.length > 0 ? `
          <div class="key-terms">
            <h4>คำศัพท์สำคัญ:</h4>
            <div class="terms-list">
              ${section.keyTerms.map(term => `<span class="term-tag">${term}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        
        ${section.noteSpace ? `
          <div class="note-space">
            <h4>พื้นที่สำหรับจดโน้ต</h4>
            <div class="note-lines">
              ${Array(5).fill(0).map(() => '<div class="note-line"></div>').join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>`;
  }

  // Generate Activities Section
  private generateActivitiesSection(content: StudySheetContent): string {
    if (content.activities.length === 0) return '';

    return `
    <section id="activities" class="content-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">กิจกรรมการเรียนรู้</h2>
        </div>
        
        <div class="activities-grid">
          ${content.activities.map((activity, index) => this.generateActivityItem(activity, index)).join('')}
        </div>
      </div>
    </section>`;
  }

  // Generate individual activity item
  private generateActivityItem(activity: Activity, index: number): string {
    const activityTypeText = {
      'individual': 'รายบุคคล',
      'group': 'กลุ่ม',
      'demonstration': 'สาธิต',
      'discussion': 'อภิปราย'
    };

    return `
    <div class="activity-item interactive-card">
      <div class="activity-header">
        <h3>กิจกรรมที่ ${index + 1}: ${activity.title}</h3>
        <div class="activity-meta">
          <span class="activity-type">${activityTypeText[activity.type] || activity.type}</span>
          <span class="activity-duration">⏱️ ${activity.duration} นาที</span>
        </div>
      </div>
      
      <div class="activity-content">
        <p class="activity-description">${activity.description}</p>
        
        ${activity.instructions.length > 0 ? `
          <div class="activity-instructions">
            <h4>ขั้นตอนการทำกิจกรรม:</h4>
            <ol>
              ${activity.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ol>
          </div>
        ` : ''}
        
        <div class="activity-materials">
          <h4>วัสดุอุปกรณ์:</h4>
          <p>${activity.materials.join(', ')}</p>
        </div>
        
        ${activity.expectedOutcome ? `
          <div class="activity-outcome">
            <h4>ผลลัพธ์ที่คาดหวัง:</h4>
            <p>${activity.expectedOutcome}</p>
          </div>
        ` : ''}
      </div>
    </div>`;
  }

  // Generate Exercises Section
  private generateExercisesSection(content: StudySheetContent): string {
    if (content.exercises.length === 0) return '';

    return `
    <section id="exercises" class="content-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">แบบฝึกหัด (${content.exercises.length} ข้อ)</h2>
        </div>
        
        <div class="exercise-grid">
          ${content.exercises.map((exercise, index) => this.generateExerciseItem(exercise, index)).join('')}
        </div>
      </div>
    </section>`;
  }

  // Generate individual exercise item
  private generateExerciseItem(exercise: Exercise, index: number): string {
    const difficultyText = {
      'easy': 'ง่าย',
      'medium': 'ปานกลาง',
      'hard': 'ยาก'
    };

    const exerciseTypeText = {
      'multiple-choice': 'ปรนัย',
      'short-answer': 'อัตนัย',
      'essay': 'เรียงความ',
      'true-false': 'ถูก/ผิด',
      'matching': 'จับคู่',
      'fill-blank': 'เติมคำ'
    };

    return `
    <div class="exercise-item interactive-card" data-exercise-id="${index + 1}">
      <div class="exercise-header">
        <span class="exercise-number">ข้อ ${index + 1}</span>
        <div class="exercise-meta">
          <span class="exercise-difficulty difficulty-${exercise.difficulty}">${difficultyText[exercise.difficulty]}</span>
          <span class="exercise-type">${exerciseTypeText[exercise.type]}</span>
          ${exercise.points ? `<span class="exercise-points">${exercise.points} คะแนน</span>` : ''}
        </div>
      </div>
      
      <div class="exercise-content">
        <p class="exercise-question">${exercise.question}</p>
        
        ${exercise.options && exercise.options.length > 0 ? `
          <div class="exercise-options">
            ${exercise.options.map((option, i) => `
              <div class="option-item">
                <span class="option-letter">${String.fromCharCode(97 + i)}</span>
                <span class="option-text">${option}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="exercise-answer">
          <div class="answer-space">
            <p>พื้นที่สำหรับตอบ (${exercise.answerSpace} บรรทัด)</p>
            ${Array(Math.min(exercise.answerSpace, 5)).fill(0).map(() => '<div class="answer-line"></div>').join('')}
          </div>
        </div>
      </div>
    </div>`;
  }

  // Generate Summary Section
  private generateSummarySection(content: StudySheetContent): string {
    return `
    <section id="summary" class="content-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">สรุปบทเรียน</h2>
        </div>
        
        <div class="summary-content interactive-card">
          <p>${content.summary}</p>
        </div>
      </div>
    </section>`;
  }

  // Generate Footer Section
  private generateFooterSection(): string {
    return `
    <footer id="footer" class="footer-section">
      <div class="container">
        <div class="footer-content">
          <p>&copy; 2024 Login-Learning. สร้างแผ่นงานการเรียนรู้ด้วย AI</p>
          <p>พัฒนาโดย GenCouce - Study Sheet Generator</p>
        </div>
      </div>
    </footer>`;
  }

  // Generate Image Element
  private generateImageElement(image: ImageData): string {
    return `
    <div class="image-element">
      <div class="image-placeholder">
        <span class="image-icon">🖼️</span>
      </div>
      <div class="image-caption">
        <p><strong>${image.alt}</strong></p>
        ${image.caption ? `<p>${image.caption}</p>` : ''}
      </div>
    </div>`;
  }

  // Generate Diagram Element
  private generateDiagramElement(animation: AnimationData): string {
    return `
    <div class="diagram-element">
      <div class="diagram-placeholder">
        <span class="diagram-icon">📊</span>
        <p>${animation.type}</p>
      </div>
      <div class="diagram-info">
        <h4>${animation.title}</h4>
        <p>${animation.description}</p>
      </div>
    </div>`;
  }

  // Generate CSS with theme variables
  private generateCSS(): string {
    return WEB_CSS_TEMPLATE
      .replace(/\{\{PRIMARY_COLOR\}\}/g, this.theme.primaryColor)
      .replace(/\{\{SECONDARY_COLOR\}\}/g, this.theme.secondaryColor)
      .replace(/\{\{FONT_FAMILY\}\}/g, this.theme.fontFamily)
      .replace(/\{\{FONT_SIZE_BASE\}\}/g, this.theme.fontSize.base.toString())
      .replace(/\{\{FONT_SIZE_HEADING\}\}/g, this.theme.fontSize.heading.toString())
      .replace(/\{\{FONT_SIZE_SMALL\}\}/g, this.theme.fontSize.small.toString())
      .replace(/\{\{SPACING_SMALL\}\}/g, this.theme.spacing.small.toString())
      .replace(/\{\{SPACING_MEDIUM\}\}/g, this.theme.spacing.medium.toString())
      .replace(/\{\{SPACING_LARGE\}\}/g, this.theme.spacing.large.toString())
      .replace(/\{\{BORDER_RADIUS\}\}/g, this.theme.borderRadius.toString())
      .replace(/\{\{ANIMATION_DURATION\}\}/g, this.theme.animations.duration.toString())
      .replace(/\{\{ANIMATION_EASING\}\}/g, this.theme.animations.easing);
  }

  // Generate JavaScript
  private generateJavaScript(): string {
    return WEB_JS_TEMPLATE;
  }

  // Assemble complete page
  private assembleCompletePage(
    content: StudySheetContent,
    htmlContent: string,
    cssContent: string,
    jsContent: string
  ): string {
    return `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title} - Login-Learning</title>
    <meta name="description" content="แผ่นงานการเรียนรู้ ${content.title} สร้างโดย Login-Learning">
    <meta name="author" content="Login-Learning">
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Progress Tracker -->
    <div class="progress-tracker">
        <div class="progress-bar"></div>
    </div>
    
    <style>
    ${cssContent}
    
    /* Additional responsive styles */
    .image-element, .diagram-element {
        margin: 1rem 0;
        padding: 1rem;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        background: var(--background-color);
    }
    
    .image-placeholder, .diagram-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        height: 150px;
        background: var(--accent-color);
        border-radius: var(--border-radius);
        margin-bottom: 0.5rem;
    }
    
    .image-icon, .diagram-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }
    
    .key-terms .terms-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }
    
    .term-tag {
        padding: 0.25rem 0.5rem;
        background: var(--primary-color);
        color: white;
        border-radius: calc(var(--border-radius) / 2);
        font-size: 0.875rem;
    }
    
    .note-space {
        margin-top: 1rem;
        padding: 1rem;
        border: 2px dashed var(--border-color);
        border-radius: var(--border-radius);
    }
    
    .note-lines .note-line,
    .answer-space .answer-line {
        height: 2px;
        background: #E5E7EB;
        margin: 1rem 0;
    }
    
    .activity-meta, .exercise-meta {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }
    
    .activity-type, .exercise-type, .exercise-difficulty {
        padding: 0.25rem 0.5rem;
        border-radius: calc(var(--border-radius) / 2);
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .difficulty-easy { background: #DEF7EC; color: #03543F; }
    .difficulty-medium { background: #FEF3C7; color: #92400E; }
    .difficulty-hard { background: #FEE2E2; color: #991B1B; }
    
    .option-item {
        display: flex;
        align-items: center;
        margin: 0.5rem 0;
    }
    
    .option-letter {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        background: var(--accent-color);
        border-radius: 50%;
        margin-right: 0.5rem;
        font-weight: 500;
        font-size: 0.875rem;
    }
    </style>
</head>
<body>
    ${this.generateNavigation()}
    
    <main>
        ${htmlContent}
    </main>
    
    <script>
    ${jsContent}
    </script>
</body>
</html>`;
  }
}

// Utility function for web export
export const exportStudySheetToWeb = async (
  content: StudySheetContent,
  options: Partial<WebExportOptions> = {},
  theme: Partial<WebThemeOptions> = {}
): Promise<WebExportResponse> => {
  const finalOptions: WebExportOptions = { ...DEFAULT_WEB_OPTIONS, ...options };
  const finalTheme: WebThemeOptions = { ...LOGIN_LEARNING_WEB_THEME, ...theme };
  
  const webService = new WebExportService(finalOptions, finalTheme);
  
  const request: WebExportRequest = {
    studySheetContent: content,
    options: finalOptions,
    theme: finalTheme
  };

  return await webService.exportToWeb(request);
};

export default WebExportService;