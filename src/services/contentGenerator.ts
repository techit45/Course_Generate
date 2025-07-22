import { 
  StudySheetContent, 
  ContentSection, 
  Exercise, 
  Activity, 
  ContentMetadata,
  TeachingSession,
  TeachingPhase,
  AIRequest,
  GradeLevel,
  ContentAmount,
  ExerciseAmount,
  ImageSuggestionRequest,
  DiagramGenerationRequest,
  EnhancedImageSuggestion,
  GeneratedDiagram
} from '@/types';
import ImageSuggestionService from './imageService';
import DiagramGenerationService from './diagramService';
import ImagePlacementService from './imagePlacementService';
import { 
  getContentSpecification, 
  calculateTimeAllocation, 
  contentTemplates,
  teachingPhaseTemplates 
} from '@/config/contentTemplates';

export class ContentGenerator {
  
  // Generate content structure based on user inputs
  static generateContentStructure(request: AIRequest): {
    specs: ReturnType<typeof getContentSpecification>;
    timeAllocation: ReturnType<typeof calculateTimeAllocation>;
    template: typeof contentTemplates.traditional;
    teachingSession: TeachingSession;
  } {
    // Validate and provide defaults for request parameters
    const validatedRequest: AIRequest = {
      topic: request.topic || 'หัวข้อการเรียน',
      gradeLevel: request.gradeLevel || 'ม.1',
      contentAmount: request.contentAmount || 'ปานกลาง',
      exerciseAmount: request.exerciseAmount || 'ปานกลาง'
    };

    const specs = getContentSpecification(
      validatedRequest.contentAmount,
      validatedRequest.exerciseAmount,
      validatedRequest.gradeLevel
    );

    const timeAllocation = calculateTimeAllocation(validatedRequest.contentAmount);
    
    // Select appropriate template based on content amount
    let templateKey = 'traditional';
    if (validatedRequest.contentAmount === 'น้อย') templateKey = 'traditional';
    else if (validatedRequest.contentAmount === 'ปานกลาง') templateKey = 'interactive';
    else templateKey = 'inquiry';

    const template = contentTemplates[templateKey];
    
    const teachingSession = this.generateTeachingSession(validatedRequest, timeAllocation);

    return {
      specs,
      timeAllocation,
      template,
      teachingSession
    };
  }

  // Generate teaching session structure for 4 hours
  static generateTeachingSession(
    request: AIRequest, 
    timeAllocation: Record<string, number>
  ): TeachingSession {
    const sessionId = `session-${Date.now()}`;
    const totalDuration = 240; // 4 hours in minutes

    // Create teaching phases based on content amount
    const phases: TeachingPhase[] = [];
    
    // Opening phase (always included)
    phases.push({
      id: `${sessionId}-opening`,
      name: teachingPhaseTemplates.opening.name,
      duration: teachingPhaseTemplates.opening.duration,
      type: teachingPhaseTemplates.opening.type,
      content: [
        `แนะนำหัวข้อ: ${request.topic}`,
        `ระดับชั้น: ${request.gradeLevel}`,
        'ตั้งวัตถุประสงค์การเรียนรู้',
        'ทบทวนความรู้เดิม'
      ],
      methods: teachingPhaseTemplates.opening.activities
    });

    // Warm-up activity
    phases.push({
      id: `${sessionId}-warmup`,
      name: teachingPhaseTemplates.warmup.name,
      duration: teachingPhaseTemplates.warmup.duration,
      type: teachingPhaseTemplates.warmup.type,
      content: [
        `กิจกรรมอุ่นเครื่องเกี่ยวกับ ${request.topic}`,
        'การระดมสมองเรื่องความรู้เดิม',
        'การตั้งคำถามกระตุ้นความสนใจ'
      ],
      methods: teachingPhaseTemplates.warmup.activities
    });

    // Main content presentation
    const presentationDuration = timeAllocation.mainContent || 120;
    phases.push({
      id: `${sessionId}-presentation`,
      name: teachingPhaseTemplates.presentation.name,
      duration: presentationDuration,
      type: teachingPhaseTemplates.presentation.type,
      content: [
        `การนำเสนอเนื้อหาหลัก: ${request.topic}`,
        'การอธิบายแนวคิดและทฤษฎี',
        'การยกตัวอย่างที่เกี่ยวข้อง',
        'การใช้สื่อการสอนประกอบ'
      ],
      methods: teachingPhaseTemplates.presentation.activities
    });

    // Practice phase
    const practiceDuration = timeAllocation.exercises || 30;
    phases.push({
      id: `${sessionId}-practice`,
      name: teachingPhaseTemplates.practice.name,
      duration: practiceDuration,
      type: teachingPhaseTemplates.practice.type,
      content: [
        `การฝึกปฏิบัติเกี่ยวกับ ${request.topic}`,
        'การทำแบบฝึกหัดรายบุคคล',
        'การให้คำแนะนำและช่วยเหลือ'
      ],
      methods: teachingPhaseTemplates.practice.activities
    });

    // Group activity phase
    const activityDuration = timeAllocation.activities || 40;
    phases.push({
      id: `${sessionId}-groupwork`,
      name: teachingPhaseTemplates.groupwork.name,
      duration: activityDuration,
      type: teachingPhaseTemplates.groupwork.type,
      content: [
        `กิจกรรมกลุ่มเกี่ยวกับ ${request.topic}`,
        'การแลกเปลี่ยนความคิดเห็น',
        'การนำเสนอผลงานกลุ่ม'
      ],
      methods: teachingPhaseTemplates.groupwork.activities
    });

    // Assessment phase
    phases.push({
      id: `${sessionId}-assessment`,
      name: teachingPhaseTemplates.assessment.name,
      duration: teachingPhaseTemplates.assessment.duration,
      type: teachingPhaseTemplates.assessment.type,
      content: [
        `การประเมินความเข้าใจเรื่อง ${request.topic}`,
        'การตรวจสอบการบรรลุวัตถุประสงค์',
        'การให้ผลป้อนกลับ'
      ],
      methods: teachingPhaseTemplates.assessment.activities
    });

    // Closure phase
    const summaryDuration = timeAllocation.summary || 20;
    phases.push({
      id: `${sessionId}-closure`,
      name: teachingPhaseTemplates.closure.name,
      duration: summaryDuration,
      type: teachingPhaseTemplates.closure.type,
      content: [
        `สรุปประเด็นสำคัญของ ${request.topic}`,
        'เชื่อมโยงกับการเรียนรู้ต่อไป',
        'มอบหมายงานหรือการบ้าน'
      ],
      methods: teachingPhaseTemplates.closure.activities
    });

    return {
      id: sessionId,
      title: `แผนการสอน ${request.topic} (${request.gradeLevel})`,
      duration: totalDuration,
      phases,
      materials: this.generateRequiredMaterials(request),
      objectives: this.generateSessionObjectives(request)
    };
  }

  // Generate required materials for teaching session
  static generateRequiredMaterials(request: AIRequest): string[] {
    const baseMaterials = [
      'กระดานและปากกาเมจิก',
      'โปรเจคเตอร์หรือทีวี',
      'คอมพิวเตอร์หรือแท็บเล็ต',
      'เอกสารประกอบการสอน',
      'แบบฝึกหัดและใบงาน'
    ];

    // Add subject-specific materials based on topic
    const topic = request.topic.toLowerCase();
    const additionalMaterials: string[] = [];

    if (topic.includes('คณิต') || topic.includes('math')) {
      additionalMaterials.push('เครื่องคิดเลข', 'ไม้บรรทัด', 'วงเวียน', 'กราฟเปเปอร์');
    }
    
    if (topic.includes('วิทยาศาสตร์') || topic.includes('science') || topic.includes('ฟิสิกส์') || topic.includes('เคมี')) {
      additionalMaterials.push('อุปกรณ์ทดลองเบื้องต้น', 'แว่นตานิรภัย', 'ถุงมือ');
    }

    if (topic.includes('ภาษา') || topic.includes('language')) {
      additionalMaterials.push('พจนานุกรม', 'หนังสือเรียน', 'สื่อการฟัง');
    }

    return [...baseMaterials, ...additionalMaterials];
  }

  // Generate session objectives
  static generateSessionObjectives(request: AIRequest): string[] {
    const baseObjectives = [
      `นักเรียนสามารถอธิบายแนวคิดพื้นฐานของ ${request.topic} ได้`,
      `นักเรียนสามารถประยุกต์ใช้ความรู้เรื่อง ${request.topic} ในสถานการณ์ต่างๆ ได้`,
      `นักเรียนมีทัศนคติที่ดีต่อการเรียนรู้เรื่อง ${request.topic}`
    ];

    // Add grade-specific objectives
    const gradeSpecificObjectives: Record<GradeLevel, string[]> = {
      'ม.1': ['นักเรียนสามารถจำและเข้าใจความรู้พื้นฐานได้'],
      'ม.2': ['นักเรียนสามารถเชื่อมโยงความรู้กับประสบการณ์ได้'],
      'ม.3': ['นักเรียนสามารถวิเคราะห์และเปรียบเทียบได้'],
      'ม.4': ['นักเรียนสามารถวิเคราะห์และสังเคราะห์ความรู้ได้'],
      'ม.5': ['นักเรียนสามารถประเมินและสร้างสรรค์ผลงานได้'],
      'ม.6': ['นักเรียนสามารถคิดเชิงวิพากษ์และแก้ปัญหาซับซ้อนได้']
    };

    return [...baseObjectives, ...gradeSpecificObjectives[request.gradeLevel]];
  }

  // Format and validate AI response with image integration
  static async formatAIResponse(
    rawResponse: StudySheetContent,
    request: AIRequest
  ): Promise<StudySheetContent> {
    const { specs } = this.generateContentStructure(request);
    
    // Ensure minimum content requirements
    const formattedContent: StudySheetContent = {
      title: rawResponse.title || `ชีทเรียนเรื่อง ${request.topic}`,
      objectives: this.validateObjectives(rawResponse.objectives || []),
      mainContent: this.validateAndFormatContent(rawResponse.mainContent || [], specs),
      exercises: this.validateAndFormatExercises(rawResponse.exercises || [], specs, request.gradeLevel),
      activities: this.validateAndFormatActivities(rawResponse.activities || [], specs),
      summary: rawResponse.summary || `สรุปบทเรียนเรื่อง ${request.topic}`,
      images: rawResponse.images || [],
      metadata: this.generateMetadata(rawResponse, request, specs)
    };

    // Generate and place images and diagrams
    await this.integrateVisualElements(formattedContent, request);

    return formattedContent;
  }

  // New method to integrate visual elements (images and diagrams)
  static async integrateVisualElements(
    content: StudySheetContent,
    request: AIRequest
  ): Promise<void> {
    try {
      // Generate image suggestions for different sections
      const imageSuggestions = await this.generateImageSuggestions(content, request);
      
      // Generate diagrams for complex concepts
      const diagrams = await this.generateDiagrams(content, request);
      
      // Place images and diagrams strategically in the content
      const placementResult = ImagePlacementService.placeImagesInStudySheet(
        content,
        imageSuggestions,
        diagrams,
        request.gradeLevel
      );

      if (!placementResult.success) {
        console.warn('Image placement warnings:', placementResult.warnings);
      }

      // Update metadata with visual elements information
      if (content.metadata) {
        content.metadata = {
          ...content.metadata,
          totalImages: placementResult.placedImages.length,
          totalDiagrams: placementResult.placedDiagrams.length,
          visualIntegration: true
        } as any;
      }

    } catch (error) {
      console.error('Error integrating visual elements:', error);
      // Continue without visual elements if there's an error
    }
  }

  // Generate image suggestions for the study sheet content
  static async generateImageSuggestions(
    content: StudySheetContent,
    request: AIRequest
  ): Promise<EnhancedImageSuggestion[]> {
    const allSuggestions: EnhancedImageSuggestion[] = [];

    // Generate suggestions for each content section
    for (const section of content.mainContent) {
      const imageRequest: ImageSuggestionRequest = {
        topic: request.topic,
        gradeLevel: request.gradeLevel,
        sectionType: section.type,
        keywords: this.extractKeywords(section.title, section.content),
        context: section.content
      };

      try {
        const response = await ImageSuggestionService.generateImageSuggestions(imageRequest);
        allSuggestions.push(...response.suggestions);
      } catch (error) {
        console.error(`Error generating images for section ${section.title}:`, error);
      }
    }

    // Generate general topic images
    const generalRequest: ImageSuggestionRequest = {
      topic: request.topic,
      gradeLevel: request.gradeLevel,
      sectionType: 'theory',
      keywords: this.extractTopicKeywords(request.topic),
      context: content.summary
    };

    try {
      const response = await ImageSuggestionService.generateImageSuggestions(generalRequest);
      allSuggestions.push(...response.suggestions);
    } catch (error) {
      console.error('Error generating general topic images:', error);
    }

    // Remove duplicates and prioritize
    return this.prioritizeImageSuggestions(allSuggestions, request.gradeLevel);
  }

  // Generate diagrams for complex concepts
  static async generateDiagrams(
    content: StudySheetContent,
    request: AIRequest
  ): Promise<GeneratedDiagram[]> {
    const diagrams: GeneratedDiagram[] = [];

    // Identify sections that would benefit from diagrams
    const diagramCandidates = content.mainContent.filter(section => 
      section.type === 'theory' || section.type === 'explanation'
    );

    for (const section of diagramCandidates.slice(0, 3)) { // Limit to 3 diagrams
      const diagramRequest: DiagramGenerationRequest = {
        concept: section.title,
        gradeLevel: request.gradeLevel,
        diagramType: this.selectDiagramType(section.content, request.topic),
        complexity: this.determineDiagramComplexity(request.gradeLevel),
        context: section.content
      };

      try {
        const response = await DiagramGenerationService.generateDiagram(diagramRequest);
        diagrams.push(response.diagram);
        
        // Add alternatives if available
        if (response.alternatives.length > 0) {
          diagrams.push(response.alternatives[0]); // Add one alternative
        }
      } catch (error) {
        console.error(`Error generating diagram for ${section.title}:`, error);
      }
    }

    return diagrams;
  }

  // Helper methods for visual integration
  static extractKeywords(title: string, content: string): string[] {
    // Simple keyword extraction - in real implementation, could use NLP
    const text = `${title} ${content}`.toLowerCase();
    const keywords: string[] = [];

    // Common educational keywords
    const educationalTerms = [
      'แนวคิด', 'หลักการ', 'วิธีการ', 'ขั้นตอน', 'กระบวนการ',
      'ตัวอย่าง', 'การประยุกต์', 'การเปรียบเทียบ', 'การวิเคราะห์'
    ];

    educationalTerms.forEach(term => {
      if (text.includes(term)) {
        keywords.push(term);
      }
    });

    // Extract key phrases (simple approach)
    const words = text.split(/\s+/).filter(word => word.length > 3);
    keywords.push(...words.slice(0, 5));

    return Array.from(new Set(keywords)); // Remove duplicates
  }

  static extractTopicKeywords(topic: string): string[] {
    const words = topic.split(/\s+/);
    return words.filter(word => word.length > 2);
  }

  static selectDiagramType(content: string, topic: string): DiagramGenerationRequest['diagramType'] {
    const contentLower = content.toLowerCase();
    const topicLower = topic.toLowerCase();

    if (contentLower.includes('ขั้นตอน') || contentLower.includes('กระบวนการ') || contentLower.includes('วิธีการ')) {
      return 'process';
    }
    if (contentLower.includes('เวลา') || contentLower.includes('ประวัติ') || contentLower.includes('วิวัฒนาการ')) {
      return 'timeline';
    }
    if (contentLower.includes('สถิติ') || contentLower.includes('ข้อมูล') || contentLower.includes('เปรียบเทียบ')) {
      return 'chart';
    }
    if (contentLower.includes('ความสัมพันธ์') || contentLower.includes('แนวคิด') || topicLower.includes('คณิต')) {
      return 'concept-map';
    }

    return 'diagram'; // Default
  }

  static determineDiagramComplexity(gradeLevel: GradeLevel): DiagramGenerationRequest['complexity'] {
    const complexityMap = {
      'ม.1': 'simple', 'ม.2': 'simple', 'ม.3': 'moderate',
      'ม.4': 'moderate', 'ม.5': 'complex', 'ม.6': 'complex'
    };
    return complexityMap[gradeLevel] as DiagramGenerationRequest['complexity'];
  }

  static prioritizeImageSuggestions(
    suggestions: EnhancedImageSuggestion[], 
    gradeLevel: GradeLevel
  ): EnhancedImageSuggestion[] {
    // Remove duplicates based on title similarity
    const uniqueSuggestions = suggestions.filter((suggestion, index, arr) => 
      arr.findIndex(s => s.title === suggestion.title) === index
    );

    // Sort by educational value and grade appropriateness
    return uniqueSuggestions
      .filter(s => s.ageAppropriate)
      .sort((a, b) => b.educationalValue - a.educationalValue)
      .slice(0, 15); // Limit to 15 suggestions
  }

  // Validate and format objectives
  static validateObjectives(objectives: string[]): string[] {
    if (objectives.length < 3) {
      return [
        'นักเรียนสามารถเข้าใจแนวคิดพื้นฐานได้',
        'นักเรียนสามารถประยุกต์ใช้ความรู้ได้',
        'นักเรียนมีทัศนคติที่ดีต่อการเรียนรู้'
      ];
    }
    return objectives.slice(0, 6); // Maximum 6 objectives
  }

  // Validate and format content sections
  static validateAndFormatContent(
    content: ContentSection[], 
    specs: ReturnType<typeof getContentSpecification>
  ): ContentSection[] {
    const minSections = specs.sectionCount[0];
    const maxSections = specs.sectionCount[1];
    
    // Ensure minimum sections
    while (content.length < minSections) {
      content.push({
        id: `section-${content.length + 1}`,
        title: `หัวข้อที่ ${content.length + 1}`,
        content: 'เนื้อหาในหัวข้อนี้',
        type: 'theory',
        noteSpace: true
      });
    }

    // Trim to maximum sections
    content = content.slice(0, maxSections);

    // Add required fields and format
    return content.map((section, index) => ({
      ...section,
      id: section.id || `section-${index + 1}`,
      noteSpace: section.noteSpace !== false,
      duration: section.duration || this.calculateSectionDuration(section.type)
    }));
  }

  // Validate and format exercises
  static validateAndFormatExercises(
    exercises: Exercise[], 
    specs: ReturnType<typeof getContentSpecification>,
    gradeLevel: GradeLevel
  ): Exercise[] {
    const minExercises = specs.exerciseCount[0];
    const maxExercises = specs.exerciseCount[1];
    const difficulty = specs.difficultyDistribution;

    // Ensure minimum exercises
    while (exercises.length < minExercises) {
      exercises.push({
        id: `exercise-${exercises.length + 1}`,
        question: `คำถามข้อที่ ${exercises.length + 1}`,
        type: 'short-answer',
        answerSpace: 3,
        difficulty: this.assignDifficulty(exercises.length, difficulty)
      });
    }

    // Trim to maximum exercises
    exercises = exercises.slice(0, maxExercises);

    // Format exercises
    return exercises.map((exercise, index) => ({
      ...exercise,
      id: exercise.id || `exercise-${index + 1}`,
      answerSpace: exercise.answerSpace || this.getDefaultAnswerSpace(exercise.type),
      difficulty: exercise.difficulty || this.assignDifficulty(index, difficulty),
      points: exercise.points || this.assignPoints(exercise.difficulty)
    }));
  }

  // Validate and format activities
  static validateAndFormatActivities(
    activities: Activity[], 
    specs: ReturnType<typeof getContentSpecification>
  ): Activity[] {
    const minActivities = specs.activityCount[0];
    const maxActivities = specs.activityCount[1];

    // Ensure minimum activities
    while (activities.length < minActivities) {
      activities.push({
        id: `activity-${activities.length + 1}`,
        title: `กิจกรรมที่ ${activities.length + 1}`,
        description: 'รายละเอียดของกิจกรรม',
        duration: 30,
        materials: ['วัสดุพื้นฐาน'],
        type: 'group',
        instructions: ['ขั้นตอนการทำกิจกรรม'],
        expectedOutcome: 'ผลลัพธ์ที่คาดหวัง'
      });
    }

    // Trim to maximum activities
    activities = activities.slice(0, maxActivities);

    // Format activities
    return activities.map((activity, index) => ({
      ...activity,
      id: activity.id || `activity-${index + 1}`,
      type: activity.type || 'group',
      instructions: activity.instructions || ['ทำตามคำแนะนำ'],
      expectedOutcome: activity.expectedOutcome || 'ผลการเรียนรู้ที่คาดหวัง'
    }));
  }

  // Generate content metadata
  static generateMetadata(
    content: StudySheetContent,
    request: AIRequest,
    specs: ReturnType<typeof getContentSpecification>
  ): ContentMetadata {
    const totalDuration = content.mainContent.reduce((sum, section) => 
      sum + (section.duration || 0), 0
    ) + content.activities.reduce((sum, activity) => 
      sum + activity.duration, 0
    );

    return {
      totalDuration,
      pageCount: Math.floor(Math.random() * (specs.pageRange[1] - specs.pageRange[0] + 1)) + specs.pageRange[0],
      sectionCount: content.mainContent.length,
      exerciseCount: content.exercises.length,
      activityCount: content.activities.length,
      difficultyLevel: request.gradeLevel,
      contentType: request.topic,
      generatedAt: new Date()
    };
  }

  // Helper methods
  static calculateSectionDuration(type: ContentSection['type']): number {
    const durations = {
      theory: 25,
      explanation: 30,
      example: 20,
      practice: 35,
      summary: 15
    };
    return durations[type] || 25;
  }

  static assignDifficulty(index: number, distribution: { easy: number; medium: number; hard: number }): Exercise['difficulty'] {
    const rand = Math.random() * 100;
    if (rand < distribution.easy) return 'easy';
    if (rand < distribution.easy + distribution.medium) return 'medium';
    return 'hard';
  }

  static getDefaultAnswerSpace(type: Exercise['type']): number {
    const spaces = {
      'multiple-choice': 1,
      'true-false': 1,
      'short-answer': 3,
      'essay': 8,
      'matching': 2,
      'fill-blank': 2
    };
    return spaces[type] || 3;
  }

  static assignPoints(difficulty: Exercise['difficulty']): number {
    const points = { easy: 1, medium: 2, hard: 3 };
    return points[difficulty];
  }
}

// Export convenience functions
export const generateContentStructure = ContentGenerator.generateContentStructure;
export const formatAIResponse = ContentGenerator.formatAIResponse;
export const generateTeachingSession = ContentGenerator.generateTeachingSession;