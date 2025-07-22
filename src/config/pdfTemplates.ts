import { 
  PDFTemplate, 
  PDFOptions, 
  BrandingOptions, 
  PageLayout, 
  PDFSection, 
  PDFStyling,
  SectionLayout,
  TextStyle
} from '@/types';

// Login-Learning Branding Configuration
export const LOGIN_LEARNING_BRANDING: BrandingOptions = {
  companyName: 'Login Learning',
  primaryColor: '#1E40AF', // Blue-800
  secondaryColor: '#3B82F6', // Blue-500
  fontFamily: 'Kanit, sans-serif',
  watermark: 'Login Learning - Study Sheet',
  footerText: 'สร้างโดย Login Learning • www.loginlearning.com'
};

// Default PDF Options
export const DEFAULT_PDF_OPTIONS: PDFOptions = {
  format: 'A4',
  orientation: 'portrait',
  margins: {
    top: 20,
    right: 15,
    bottom: 20,
    left: 15
  },
  includeImages: true,
  includeDiagrams: true,
  noteSpacing: 'normal',
  pageNumbers: true,
  tableOfContents: true,
  headerFooter: true
};

// PDF Styling Configuration
export const LOGIN_LEARNING_STYLING: PDFStyling = {
  colors: {
    primary: '#1E40AF',      // Blue-800
    secondary: '#3B82F6',    // Blue-500
    text: '#1F2937',         // Gray-800
    background: '#FFFFFF',   // White
    border: '#E5E7EB',       // Gray-200
    accent: '#F3F4F6'        // Gray-100
  },
  fonts: {
    heading: 'Kanit',
    body: 'Sarabun',
    monospace: 'JetBrains Mono'
  },
  spacing: {
    small: 4,
    medium: 8,
    large: 16,
    xlarge: 24
  }
};

// Text Styles
export const TEXT_STYLES: Record<string, TextStyle> = {
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Kanit',
    color: '#1E40AF',
    lineHeight: 1.2,
    textAlign: 'center',
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Kanit',
    color: '#1E40AF',
    lineHeight: 1.3,
    textAlign: 'left',
    marginTop: 20,
    marginBottom: 12
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Kanit',
    color: '#374151',
    lineHeight: 1.3,
    textAlign: 'left',
    marginTop: 16,
    marginBottom: 8
  },
  bodyText: {
    fontSize: 12,
    fontWeight: 'normal',
    fontFamily: 'Sarabun',
    color: '#1F2937',
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 8
  },
  smallText: {
    fontSize: 10,
    fontWeight: 'normal',
    fontFamily: 'Sarabun',
    color: '#6B7280',
    lineHeight: 1.4,
    textAlign: 'left',
    marginBottom: 4
  },
  caption: {
    fontSize: 10,
    fontWeight: 'normal',
    fontFamily: 'Sarabun',
    color: '#9CA3AF',
    lineHeight: 1.4,
    textAlign: 'center',
    marginTop: 4
  }
};

// Page Layout Configuration
export const A4_LAYOUT: PageLayout = {
  width: 210, // A4 width in mm
  height: 297, // A4 height in mm
  margins: DEFAULT_PDF_OPTIONS.margins,
  columns: 1,
  gutterWidth: 0,
  headerHeight: 15,
  footerHeight: 15
};

// Section Layouts
export const SECTION_LAYOUTS: Record<string, SectionLayout> = {
  cover: {
    titleStyle: TEXT_STYLES.mainTitle,
    contentStyle: TEXT_STYLES.bodyText,
    spacing: {
      beforeTitle: 60,
      afterTitle: 40,
      betweenParagraphs: 12,
      beforeSection: 0,
      afterSection: 0
    }
  },
  tableOfContents: {
    titleStyle: TEXT_STYLES.sectionTitle,
    contentStyle: TEXT_STYLES.bodyText,
    spacing: {
      beforeTitle: 20,
      afterTitle: 16,
      betweenParagraphs: 6,
      beforeSection: 0,
      afterSection: 20
    }
  },
  content: {
    titleStyle: TEXT_STYLES.sectionTitle,
    contentStyle: TEXT_STYLES.bodyText,
    spacing: {
      beforeTitle: 16,
      afterTitle: 12,
      betweenParagraphs: 8,
      beforeSection: 8,
      afterSection: 16
    },
    noteSpace: {
      enabled: true,
      height: 40,
      style: 'lines',
      color: '#E5E7EB'
    }
  },
  exercises: {
    titleStyle: TEXT_STYLES.sectionTitle,
    contentStyle: TEXT_STYLES.bodyText,
    spacing: {
      beforeTitle: 20,
      afterTitle: 16,
      betweenParagraphs: 12,
      beforeSection: 8,
      afterSection: 20
    },
    noteSpace: {
      enabled: true,
      height: 30,
      style: 'lines',
      color: '#E5E7EB'
    }
  },
  activities: {
    titleStyle: TEXT_STYLES.sectionTitle,
    contentStyle: TEXT_STYLES.bodyText,
    spacing: {
      beforeTitle: 20,
      afterTitle: 16,
      betweenParagraphs: 10,
      beforeSection: 8,
      afterSection: 16
    }
  },
  summary: {
    titleStyle: TEXT_STYLES.sectionTitle,
    contentStyle: TEXT_STYLES.bodyText,
    spacing: {
      beforeTitle: 20,
      afterTitle: 16,
      betweenParagraphs: 8,
      beforeSection: 8,
      afterSection: 12
    }
  },
  notes: {
    titleStyle: TEXT_STYLES.sectionTitle,
    contentStyle: TEXT_STYLES.bodyText,
    spacing: {
      beforeTitle: 20,
      afterTitle: 16,
      betweenParagraphs: 2,
      beforeSection: 0,
      afterSection: 0
    },
    noteSpace: {
      enabled: true,
      height: 200, // Large note space
      style: 'lines',
      color: '#E5E7EB'
    }
  }
};

// Default PDF Template
export const DEFAULT_STUDY_SHEET_TEMPLATE: PDFTemplate = {
  id: 'login-learning-default',
  name: 'Login Learning Study Sheet',
  description: 'เทมเพลตมาตรฐานสำหรับชีทการเรียนของ Login Learning',
  pageLayout: A4_LAYOUT,
  sections: [
    {
      id: 'cover',
      type: 'cover',
      title: 'หน้าปก',
      startNewPage: true,
      layout: SECTION_LAYOUTS.cover
    },
    {
      id: 'toc',
      type: 'toc',
      title: 'สารบัญ',
      startNewPage: true,
      layout: SECTION_LAYOUTS.tableOfContents
    },
    {
      id: 'objectives',
      type: 'content',
      title: 'วัตถุประสงค์การเรียนรู้',
      startNewPage: false,
      layout: SECTION_LAYOUTS.content
    },
    {
      id: 'main-content',
      type: 'content',
      title: 'เนื้อหาหลัก',
      startNewPage: false,
      layout: SECTION_LAYOUTS.content
    },
    {
      id: 'activities',
      type: 'activities',
      title: 'กิจกรรมการเรียนรู้',
      startNewPage: true,
      layout: SECTION_LAYOUTS.activities
    },
    {
      id: 'exercises',
      type: 'exercises',
      title: 'แบบฝึกหัด',
      startNewPage: true,
      layout: SECTION_LAYOUTS.exercises
    },
    {
      id: 'summary',
      type: 'summary',
      title: 'สรุป',
      startNewPage: false,
      layout: SECTION_LAYOUTS.summary
    },
    {
      id: 'notes',
      type: 'notes',
      title: 'หน้าจดบันทึก',
      startNewPage: true,
      pageBreakAfter: false,
      layout: SECTION_LAYOUTS.notes
    }
  ],
  styling: LOGIN_LEARNING_STYLING
};

// Alternative Templates
export const COMPACT_TEMPLATE: PDFTemplate = {
  ...DEFAULT_STUDY_SHEET_TEMPLATE,
  id: 'login-learning-compact',
  name: 'Login Learning Compact',
  description: 'เทมเพลตแบบกะทัดรัดสำหรับเนื้อหาน้อย',
  sections: DEFAULT_STUDY_SHEET_TEMPLATE.sections.map(section => ({
    ...section,
    layout: {
      ...section.layout,
      spacing: {
        ...section.layout.spacing,
        beforeSection: Math.max(4, section.layout.spacing.beforeSection / 2),
        afterSection: Math.max(8, section.layout.spacing.afterSection / 2),
        betweenParagraphs: Math.max(4, section.layout.spacing.betweenParagraphs / 2)
      }
    }
  }))
};

export const EXPANDED_TEMPLATE: PDFTemplate = {
  ...DEFAULT_STUDY_SHEET_TEMPLATE,
  id: 'login-learning-expanded',
  name: 'Login Learning Expanded',
  description: 'เทมเพลตแบบขยายสำหรับเนื้อหามาก',
  sections: [
    ...DEFAULT_STUDY_SHEET_TEMPLATE.sections,
    // Add additional note pages
    {
      id: 'extra-notes-1',
      type: 'notes',
      title: 'หน้าจดบันทึกเพิ่มเติม 1',
      startNewPage: true,
      layout: SECTION_LAYOUTS.notes
    },
    {
      id: 'extra-notes-2',
      type: 'notes',
      title: 'หน้าจดบันทึกเพิ่มเติม 2',
      startNewPage: true,
      layout: SECTION_LAYOUTS.notes
    },
    {
      id: 'extra-notes-3',
      type: 'notes',
      title: 'หน้าจดบันทึกเพิ่มเติม 3',
      startNewPage: true,
      layout: SECTION_LAYOUTS.notes
    }
  ]
};

// Template Selection Helper
export const getTemplateByContentAmount = (
  contentAmount: 'น้อย' | 'ปานกลาง' | 'มาก'
): PDFTemplate => {
  switch (contentAmount) {
    case 'น้อย':
      return COMPACT_TEMPLATE;
    case 'มาก':
      return EXPANDED_TEMPLATE;
    case 'ปานกลาง':
    default:
      return DEFAULT_STUDY_SHEET_TEMPLATE;
  }
};

// PDF Generation Settings by Grade Level
export const GRADE_PDF_SETTINGS = {
  'ม.1': {
    fontSize: { heading: 20, body: 12, small: 10 },
    lineSpacing: 1.8,
    noteSpaceHeight: 35,
    maxContentPerPage: 600
  },
  'ม.2': {
    fontSize: { heading: 19, body: 12, small: 10 },
    lineSpacing: 1.7,
    noteSpaceHeight: 35,
    maxContentPerPage: 650
  },
  'ม.3': {
    fontSize: { heading: 18, body: 11, small: 9 },
    lineSpacing: 1.6,
    noteSpaceHeight: 30,
    maxContentPerPage: 700
  },
  'ม.4': {
    fontSize: { heading: 18, body: 11, small: 9 },
    lineSpacing: 1.6,
    noteSpaceHeight: 30,
    maxContentPerPage: 750
  },
  'ม.5': {
    fontSize: { heading: 17, body: 10, small: 8 },
    lineSpacing: 1.5,
    noteSpaceHeight: 25,
    maxContentPerPage: 800
  },
  'ม.6': {
    fontSize: { heading: 17, body: 10, small: 8 },
    lineSpacing: 1.5,
    noteSpaceHeight: 25,
    maxContentPerPage: 850
  }
};

export default {
  DEFAULT_STUDY_SHEET_TEMPLATE,
  COMPACT_TEMPLATE,
  EXPANDED_TEMPLATE,
  LOGIN_LEARNING_BRANDING,
  DEFAULT_PDF_OPTIONS,
  LOGIN_LEARNING_STYLING,
  TEXT_STYLES,
  SECTION_LAYOUTS,
  getTemplateByContentAmount,
  GRADE_PDF_SETTINGS
};