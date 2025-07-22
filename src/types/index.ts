export type GradeLevel = "ม.1" | "ม.2" | "ม.3" | "ม.4" | "ม.5" | "ม.6";
export type ContentAmount = "น้อย" | "ปานกลาง" | "มาก";
export type ExerciseAmount = "น้อย" | "ปานกลาง" | "มาก";

// Form data interface with validation constraints
export interface StudySheetForm {
  topic: string;
  gradeLevel: GradeLevel;
  contentAmount: ContentAmount;
  exerciseAmount: ExerciseAmount;
}

// Form validation constraints
export interface FormValidationRules {
  topic: {
    required: string;
    minLength: { value: number; message: string };
    maxLength: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
  };
  gradeLevel: {
    required: string;
  };
  contentAmount: {
    required: string;
  };
  exerciseAmount: {
    required: string;
  };
}

// Form state management
export interface FormState {
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  submitCount: number;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Error handling types
export interface FormError {
  field: string;
  message: string;
  type: 'validation' | 'server' | 'network';
}

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  details?: any;
}

// AI Service Types
export interface AIRequest {
  topic: string;
  gradeLevel: GradeLevel;
  contentAmount: ContentAmount;
  exerciseAmount: ExerciseAmount;
}

export interface AIResponse {
  success: boolean;
  data?: StudySheetContent;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface OpenRouterConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface AIServiceError extends AppError {
  type: 'network' | 'rate_limit' | 'invalid_request' | 'server_error' | 'timeout';
  retryable: boolean;
}

export interface PromptTemplate {
  system: string;
  user: string;
  variables: string[];
}

export interface GradeLevelPrompts {
  [key: string]: {
    complexity: string;
    vocabulary: string;
    examples: string;
    exercises: string;
  };
}

export interface ContentSection {
  id: string;
  title: string;
  content: string;
  type: "theory" | "example" | "explanation" | "practice" | "summary";
  images?: ImageData[];
  animations?: AnimationData[];
  noteSpace: boolean;
  duration?: number; // minutes for this section
  objectives?: string[]; // specific objectives for this section
  keyTerms?: string[]; // important vocabulary
}

export interface Exercise {
  id: string;
  question: string;
  type: "multiple-choice" | "short-answer" | "essay" | "true-false" | "matching" | "fill-blank";
  answerSpace: number;
  difficulty: "easy" | "medium" | "hard";
  options?: string[]; // for multiple choice
  correctAnswer?: string | string[]; // for validation
  explanation?: string; // explanation of correct answer
  points?: number; // scoring weight
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  duration: number;
  materials: string[];
  type: "individual" | "group" | "demonstration" | "discussion";
  instructions: string[];
  expectedOutcome: string;
  assessmentCriteria?: string[];
}

export interface ImageData {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  source?: string;
  placement?: 'inline' | 'section-start' | 'section-end' | 'sidebar';
  size?: 'small' | 'medium' | 'large' | 'full-width';
  gradeAppropriate: boolean;
}

export interface AnimationData {
  id: string;
  type: 'diagram' | 'chart' | 'timeline' | 'process' | 'concept-map';
  title: string;
  description: string;
  data: any;
  duration?: number;
  complexity: 'simple' | 'moderate' | 'complex';
  gradeLevel: GradeLevel;
}

export interface ImageSuggestionRequest {
  topic: string;
  gradeLevel: GradeLevel;
  sectionType: ContentSection['type'];
  keywords: string[];
  context?: string;
}

export interface ImageSuggestionResponse {
  suggestions: EnhancedImageSuggestion[];
  metadata: {
    totalSuggestions: number;
    processingTime: number;
    gradeLevel: GradeLevel;
  };
}

export interface EnhancedImageSuggestion {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  imageType: 'photo' | 'illustration' | 'diagram' | 'chart' | 'infographic';
  complexity: 'simple' | 'moderate' | 'complex';
  educationalValue: number; // 1-10 scale
  ageAppropriate: boolean;
  placement: ImageData['placement'];
  size: ImageData['size'];
  alternativeText: string;
  relatedConcepts: string[];
}

export interface DiagramGenerationRequest {
  concept: string;
  gradeLevel: GradeLevel;
  diagramType: AnimationData['type'];
  complexity: AnimationData['complexity'];
  context: string;
}

export interface DiagramGenerationResponse {
  diagram: GeneratedDiagram;
  alternatives: GeneratedDiagram[];
}

export interface GeneratedDiagram {
  id: string;
  title: string;
  type: AnimationData['type'];
  svgContent?: string;
  htmlContent?: string;
  description: string;
  interactiveElements?: InteractiveElement[];
  instructions: string[];
}

export interface InteractiveElement {
  id: string;
  type: 'clickable' | 'hoverable' | 'animated';
  trigger: string;
  action: string;
  description: string;
}

export interface StudySheetContent {
  title: string;
  objectives: string[];
  mainContent: ContentSection[];
  exercises: Exercise[];
  activities: Activity[];
  summary: string;
  images: ImageSuggestion[];
  metadata?: ContentMetadata;
}

export interface ContentMetadata {
  totalDuration: number; // total minutes
  pageCount: number;
  sectionCount: number;
  exerciseCount: number;
  activityCount: number;
  difficultyLevel: GradeLevel;
  contentType: string;
  generatedAt: Date;
}

// Content generation specifications
export interface ContentSpecs {
  pageRange: [number, number];
  sectionCount: [number, number];
  exerciseCount: [number, number];
  activityCount: [number, number];
  timeDistribution: TimeDistribution;
  difficultyDistribution: DifficultyDistribution;
}

export interface TimeDistribution {
  introduction: number; // percentage
  mainContent: number;
  activities: number;
  exercises: number;
  summary: number;
}

export interface DifficultyDistribution {
  easy: number; // percentage
  medium: number;
  hard: number;
}

// Teaching session structure
export interface TeachingSession {
  id: string;
  title: string;
  duration: number; // minutes
  phases: TeachingPhase[];
  materials: string[];
  objectives: string[];
}

export interface TeachingPhase {
  id: string;
  name: string;
  duration: number;
  type: "introduction" | "explanation" | "practice" | "activity" | "assessment" | "summary";
  content: string[];
  methods: string[];
}

// Content templates
export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  structure: TemplateSection[];
  specs: ContentSpecs;
  timeAllocation: TimeDistribution;
}

export interface TemplateSection {
  type: ContentSection['type'];
  title: string;
  required: boolean;
  duration: number;
  order: number;
}

export interface ImageSuggestion {
  id: string;
  description: string;
  keywords: string[];
}

export interface StudySheet {
  id: string;
  title: string;
  topic: string;
  gradeLevel: GradeLevel;
  contentAmount: ContentAmount;
  exerciseAmount: ExerciseAmount;
  content: StudySheetContent;
  createdAt: Date;
  updatedAt: Date;
  theme: "Login-Learning-Blue";
}

// PDF Generation Types
export interface PDFGenerationRequest {
  studySheetContent: StudySheetContent;
  options: PDFOptions;
  branding: BrandingOptions;
}

export interface PDFOptions {
  format: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  includeImages: boolean;
  includeDiagrams: boolean;
  noteSpacing: 'compact' | 'normal' | 'spacious';
  pageNumbers: boolean;
  tableOfContents: boolean;
  headerFooter: boolean;
}

export interface BrandingOptions {
  companyName: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  watermark?: string;
  footerText?: string;
}

export interface PDFGenerationResponse {
  success: boolean;
  pdfBlob?: Blob;
  filename: string;
  pageCount: number;
  fileSize: number;
  generationTime: number;
  warnings?: string[];
  error?: string;
}

export interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  pageLayout: PageLayout;
  sections: PDFSection[];
  styling: PDFStyling;
}

export interface PageLayout {
  width: number;
  height: number;
  margins: PDFOptions['margins'];
  columns: number;
  gutterWidth: number;
  headerHeight: number;
  footerHeight: number;
}

export interface PDFSection {
  id: string;
  type: 'cover' | 'toc' | 'content' | 'exercises' | 'activities' | 'summary' | 'notes';
  title: string;
  startNewPage: boolean;
  pageBreakBefore?: boolean;
  pageBreakAfter?: boolean;
  layout: SectionLayout;
}

export interface SectionLayout {
  titleStyle: TextStyle;
  contentStyle: TextStyle;
  spacing: {
    beforeTitle: number;
    afterTitle: number;
    betweenParagraphs: number;
    beforeSection: number;
    afterSection: number;
  };
  noteSpace?: {
    enabled: boolean;
    height: number;
    style: 'lines' | 'grid' | 'blank';
    color: string;
  };
}

export interface TextStyle {
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'lighter';
  fontFamily: string;
  color: string;
  lineHeight: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  marginTop?: number;
  marginBottom?: number;
}

export interface PDFStyling {
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    border: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
    monospace: string;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
}

export interface PDFExportProgress {
  stage: 'preparing' | 'generating-content' | 'adding-images' | 'formatting' | 'finalizing' | 'complete';
  progress: number; // 0-100
  currentSection?: string;
  estimatedTimeRemaining?: number;
  warnings?: string[];
}

// Web Export Types
export interface WebExportRequest {
  studySheetContent: StudySheetContent;
  options: WebExportOptions;
  theme: WebThemeOptions;
}

export interface WebExportOptions {
  includeAnimations: boolean;
  includeInteractivity: boolean;
  responsiveBreakpoints: ResponsiveBreakpoints;
  navigationStyle: 'sidebar' | 'tabs' | 'accordion' | 'single-page';
  printFriendly: boolean;
  darkModeSupport: boolean;
  accessibilityFeatures: boolean;
  shareableUrl: boolean;
}

export interface WebThemeOptions {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: {
    base: number;
    heading: number;
    small: number;
  };
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
  borderRadius: number;
  shadows: boolean;
  animations: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  largeDesktop: number;
}

export interface WebExportResponse {
  success: boolean;
  htmlContent?: string;
  cssContent?: string;
  jsContent?: string;
  shareableUrl?: string;
  previewUrl?: string;
  exportTime: number;
  warnings?: string[];
  error?: string;
}

export interface WebLayoutSection {
  id: string;
  type: 'hero' | 'objectives' | 'content' | 'activities' | 'exercises' | 'summary' | 'footer';
  title: string;
  visible: boolean;
  animated: boolean;
  interactive: boolean;
  order: number;
  customCSS?: string;
}

export interface InteractiveFeature {
  id: string;
  type: 'tooltip' | 'modal' | 'collapse' | 'tabs' | 'carousel' | 'quiz' | 'progress-tracker';
  trigger: 'click' | 'hover' | 'scroll' | 'auto';
  target: string;
  content: string;
  animation?: string;
  duration?: number;
}

export interface WebAnimation {
  id: string;
  name: string;
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce' | 'pulse';
  duration: number;
  delay?: number;
  easing: string;
  trigger: 'load' | 'scroll' | 'hover' | 'click';
  target: string;
}

export interface ShareableWebExport {
  id: string;
  title: string;
  studySheetContent: StudySheetContent;
  createdAt: Date;
  expiresAt?: Date;
  accessCount: number;
  shareUrl: string;
  embedCode: string;
  settings: {
    allowDownload: boolean;
    allowPrint: boolean;
    allowShare: boolean;
    passwordProtected: boolean;
    analytics: boolean;
  };
}