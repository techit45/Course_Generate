import { 
  ImageSuggestionRequest, 
  ImageSuggestionResponse, 
  EnhancedImageSuggestion,
  GradeLevel,
  ContentSection 
} from '@/types';

export class ImageSuggestionService {
  private static readonly GRADE_APPROPRIATENESS_MAP = {
    'ม.1': { maxComplexity: 'simple', preferredTypes: ['photo', 'illustration'], educationalThreshold: 6 },
    'ม.2': { maxComplexity: 'simple', preferredTypes: ['photo', 'illustration', 'diagram'], educationalThreshold: 6 },
    'ม.3': { maxComplexity: 'moderate', preferredTypes: ['illustration', 'diagram', 'chart'], educationalThreshold: 7 },
    'ม.4': { maxComplexity: 'moderate', preferredTypes: ['diagram', 'chart', 'infographic'], educationalThreshold: 7 },
    'ม.5': { maxComplexity: 'complex', preferredTypes: ['diagram', 'chart', 'infographic'], educationalThreshold: 8 },
    'ม.6': { maxComplexity: 'complex', preferredTypes: ['chart', 'infographic', 'diagram'], educationalThreshold: 8 }
  };

  private static readonly SUBJECT_IMAGE_MAPPING = {
    'คณิตศาสตร์': {
      keywords: ['mathematical', 'numbers', 'equations', 'geometry', 'calculator', 'formulas'],
      preferredTypes: ['diagram', 'chart', 'illustration'],
      concepts: ['algebra', 'geometry', 'statistics', 'calculus']
    },
    'วิทยาศาสตร์': {
      keywords: ['science', 'laboratory', 'experiment', 'molecules', 'nature', 'research'],
      preferredTypes: ['photo', 'diagram', 'illustration'],
      concepts: ['physics', 'chemistry', 'biology', 'earth science']
    },
    'ภาษาไทย': {
      keywords: ['thai language', 'literature', 'writing', 'reading', 'poetry', 'culture'],
      preferredTypes: ['photo', 'illustration'],
      concepts: ['grammar', 'literature', 'writing', 'culture']
    },
    'ภาษาอังกฤษ': {
      keywords: ['english', 'language', 'communication', 'vocabulary', 'grammar'],
      preferredTypes: ['photo', 'illustration', 'infographic'],
      concepts: ['grammar', 'vocabulary', 'conversation', 'writing']
    },
    'สังคมศึกษา': {
      keywords: ['history', 'society', 'culture', 'geography', 'politics', 'community'],
      preferredTypes: ['photo', 'infographic', 'chart'],
      concepts: ['history', 'geography', 'civics', 'economics']
    }
  };

  public static async generateImageSuggestions(
    request: ImageSuggestionRequest
  ): Promise<ImageSuggestionResponse> {
    const startTime = Date.now();
    
    try {
      const suggestions = await this.createSuggestions(request);
      const filteredSuggestions = this.filterByGradeLevel(suggestions, request.gradeLevel);
      const enhancedSuggestions = this.enhanceSuggestions(filteredSuggestions, request);
      
      return {
        suggestions: enhancedSuggestions,
        metadata: {
          totalSuggestions: enhancedSuggestions.length,
          processingTime: Date.now() - startTime,
          gradeLevel: request.gradeLevel
        }
      };
    } catch (error) {
      console.error('Error generating image suggestions:', error);
      return {
        suggestions: this.getFallbackSuggestions(request),
        metadata: {
          totalSuggestions: 3,
          processingTime: Date.now() - startTime,
          gradeLevel: request.gradeLevel
        }
      };
    }
  }

  private static async createSuggestions(
    request: ImageSuggestionRequest
  ): Promise<EnhancedImageSuggestion[]> {
    const { topic, gradeLevel, sectionType, keywords, context } = request;
    const suggestions: EnhancedImageSuggestion[] = [];

    // Determine subject area from topic
    const subjectArea = this.identifySubjectArea(topic);
    const subjectMapping = this.SUBJECT_IMAGE_MAPPING[subjectArea as keyof typeof this.SUBJECT_IMAGE_MAPPING] || this.SUBJECT_IMAGE_MAPPING['วิทยาศาสตร์'];

    // Generate topic-specific suggestions
    const topicSuggestions = this.generateTopicSpecificSuggestions(
      topic, gradeLevel, sectionType, subjectMapping
    );
    suggestions.push(...topicSuggestions);

    // Generate section-type specific suggestions
    const sectionSuggestions = this.generateSectionSpecificSuggestions(
      sectionType, topic, gradeLevel, subjectMapping
    );
    suggestions.push(...sectionSuggestions);

    // Generate keyword-based suggestions
    const keywordSuggestions = this.generateKeywordSuggestions(
      keywords, gradeLevel, subjectMapping
    );
    suggestions.push(...keywordSuggestions);

    return suggestions;
  }

  private static identifySubjectArea(topic: string): string {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('คณิต') || topicLower.includes('เลข') || topicLower.includes('สมการ')) {
      return 'คณิตศาสตร์';
    }
    if (topicLower.includes('วิทย') || topicLower.includes('ฟิสิกส์') || topicLower.includes('เคมี') || topicLower.includes('ชีววิทยา')) {
      return 'วิทยาศาสตร์';
    }
    if (topicLower.includes('ไทย') || topicLower.includes('วรรณคดี') || topicLower.includes('ภาษาไทย')) {
      return 'ภาษาไทย';
    }
    if (topicLower.includes('english') || topicLower.includes('อังกฤษ')) {
      return 'ภาษาอังกฤษ';
    }
    if (topicLower.includes('สังคม') || topicLower.includes('ประวัติ') || topicLower.includes('ภูมิศาสตร์')) {
      return 'สังคมศึกษา';
    }

    return 'วิทยาศาสตร์'; // Default fallback
  }

  private static generateTopicSpecificSuggestions(
    topic: string,
    gradeLevel: GradeLevel,
    sectionType: ContentSection['type'],
    subjectMapping: any
  ): EnhancedImageSuggestion[] {
    const suggestions: EnhancedImageSuggestion[] = [];
    const gradeConfig = this.GRADE_APPROPRIATENESS_MAP[gradeLevel];

    // Main topic illustration
    suggestions.push({
      id: `topic-main-${Date.now()}`,
      title: `ภาพประกอบหลักเรื่อง "${topic}"`,
      description: `ภาพที่แสดงแนวคิดหลักของเรื่อง ${topic} เหมาะสำหรับนักเรียน${gradeLevel}`,
      keywords: [topic, ...subjectMapping.keywords.slice(0, 3)],
      imageType: gradeConfig.preferredTypes[0] as any,
      complexity: gradeConfig.maxComplexity as any,
      educationalValue: gradeConfig.educationalThreshold,
      ageAppropriate: true,
      placement: sectionType === 'theory' ? 'section-start' : 'inline',
      size: sectionType === 'theory' ? 'large' : 'medium',
      alternativeText: `ภาพประกอบเรื่อง ${topic} สำหรับนักเรียน${gradeLevel}`,
      relatedConcepts: subjectMapping.concepts.slice(0, 2)
    });

    // Supporting concept illustration
    suggestions.push({
      id: `topic-support-${Date.now()}`,
      title: `ภาพสนับสนุนการเรียนรู้เรื่อง "${topic}"`,
      description: `ภาพเสริมความเข้าใจในแนวคิดย่อยของเรื่อง ${topic}`,
      keywords: [...subjectMapping.keywords.slice(1, 4), 'education', 'learning'],
      imageType: gradeConfig.preferredTypes[1] as any || 'illustration',
      complexity: 'simple' as any,
      educationalValue: gradeConfig.educationalThreshold - 1,
      ageAppropriate: true,
      placement: 'inline',
      size: 'medium',
      alternativeText: `ภาพเสริมการเรียนรู้เรื่อง ${topic}`,
      relatedConcepts: [subjectMapping.concepts[1] || 'general']
    });

    return suggestions;
  }

  private static generateSectionSpecificSuggestions(
    sectionType: ContentSection['type'],
    topic: string,
    gradeLevel: GradeLevel,
    subjectMapping: any
  ): EnhancedImageSuggestion[] {
    const suggestions: EnhancedImageSuggestion[] = [];
    const gradeConfig = this.GRADE_APPROPRIATENESS_MAP[gradeLevel];

    switch (sectionType) {
      case 'theory':
        suggestions.push({
          id: `theory-${Date.now()}`,
          title: `แผนภาพแสดงทฤษฎี "${topic}"`,
          description: `แผนภาพอธิบายหลักการทฤษฎีของเรื่อง ${topic}`,
          keywords: ['theory', 'concept', 'principle', topic],
          imageType: 'diagram',
          complexity: gradeConfig.maxComplexity as any,
          educationalValue: gradeConfig.educationalThreshold,
          ageAppropriate: true,
          placement: 'section-start',
          size: 'large',
          alternativeText: `แผนภาพทฤษฎีเรื่อง ${topic}`,
          relatedConcepts: ['theory', 'principles']
        });
        break;

      case 'example':
        suggestions.push({
          id: `example-${Date.now()}`,
          title: `ตัวอย่างประกอบเรื่อง "${topic}"`,
          description: `ภาพตัวอย่างที่เป็นรูปธรรมของเรื่อง ${topic}`,
          keywords: ['example', 'real-world', 'application', topic],
          imageType: 'photo',
          complexity: 'simple' as any,
          educationalValue: gradeConfig.educationalThreshold - 1,
          ageAppropriate: true,
          placement: 'inline',
          size: 'medium',
          alternativeText: `ตัวอย่างประกอบเรื่อง ${topic}`,
          relatedConcepts: ['examples', 'applications']
        });
        break;

      case 'practice':
        suggestions.push({
          id: `practice-${Date.now()}`,
          title: `ภาพประกอบการฝึกปฏิบัติ "${topic}"`,
          description: `ภาพแสดงขั้นตอนการฝึกปฏิบัติเรื่อง ${topic}`,
          keywords: ['practice', 'exercise', 'steps', topic],
          imageType: 'illustration',
          complexity: 'moderate' as any,
          educationalValue: gradeConfig.educationalThreshold,
          ageAppropriate: true,
          placement: 'section-start',
          size: 'medium',
          alternativeText: `ภาพการฝึกปฏิบัติเรื่อง ${topic}`,
          relatedConcepts: ['practice', 'skills']
        });
        break;

      default:
        suggestions.push({
          id: `general-${Date.now()}`,
          title: `ภาพประกอบทั่วไปเรื่อง "${topic}"`,
          description: `ภาพประกอบทั่วไปสำหรับเรื่อง ${topic}`,
          keywords: [topic, 'education', 'learning'],
          imageType: 'illustration',
          complexity: 'simple' as any,
          educationalValue: gradeConfig.educationalThreshold - 1,
          ageAppropriate: true,
          placement: 'inline',
          size: 'medium',
          alternativeText: `ภาพประกอบเรื่อง ${topic}`,
          relatedConcepts: ['general']
        });
    }

    return suggestions;
  }

  private static generateKeywordSuggestions(
    keywords: string[],
    gradeLevel: GradeLevel,
    subjectMapping: any
  ): EnhancedImageSuggestion[] {
    const suggestions: EnhancedImageSuggestion[] = [];
    const gradeConfig = this.GRADE_APPROPRIATENESS_MAP[gradeLevel];

    keywords.slice(0, 2).forEach((keyword, index) => {
      suggestions.push({
        id: `keyword-${keyword}-${Date.now()}`,
        title: `ภาพประกอบคำสำคัญ "${keyword}"`,
        description: `ภาพที่แสดงความหมายของคำสำคัญ "${keyword}"`,
        keywords: [keyword, ...subjectMapping.keywords.slice(0, 2)],
        imageType: gradeConfig.preferredTypes[index % gradeConfig.preferredTypes.length] as any,
        complexity: index === 0 ? gradeConfig.maxComplexity as any : 'simple' as any,
        educationalValue: gradeConfig.educationalThreshold - index,
        ageAppropriate: true,
        placement: 'inline',
        size: 'small',
        alternativeText: `ภาพประกอบคำสำคัญ ${keyword}`,
        relatedConcepts: [keyword]
      });
    });

    return suggestions;
  }

  private static filterByGradeLevel(
    suggestions: EnhancedImageSuggestion[],
    gradeLevel: GradeLevel
  ): EnhancedImageSuggestion[] {
    const gradeConfig = this.GRADE_APPROPRIATENESS_MAP[gradeLevel];

    return suggestions.filter(suggestion => {
      // Check complexity appropriateness
      const complexityOrder = { 'simple': 1, 'moderate': 2, 'complex': 3 };
      const maxComplexityLevel = complexityOrder[gradeConfig.maxComplexity as keyof typeof complexityOrder];
      const suggestionComplexityLevel = complexityOrder[suggestion.complexity];

      if (suggestionComplexityLevel > maxComplexityLevel) {
        return false;
      }

      // Check educational value threshold
      if (suggestion.educationalValue < gradeConfig.educationalThreshold) {
        return false;
      }

      // Check preferred image types
      if (!gradeConfig.preferredTypes.includes(suggestion.imageType)) {
        // Allow if educational value is high enough
        return suggestion.educationalValue >= gradeConfig.educationalThreshold + 1;
      }

      return true;
    });
  }

  private static enhanceSuggestions(
    suggestions: EnhancedImageSuggestion[],
    request: ImageSuggestionRequest
  ): EnhancedImageSuggestion[] {
    return suggestions.map(suggestion => ({
      ...suggestion,
      // Enhance description with grade-specific language
      description: this.enhanceDescriptionForGrade(suggestion.description, request.gradeLevel),
      // Add context-specific keywords
      keywords: [...suggestion.keywords, ...request.keywords.slice(0, 2)],
      // Ensure age appropriateness
      ageAppropriate: true
    }));
  }

  private static enhanceDescriptionForGrade(description: string, gradeLevel: GradeLevel): string {
    const gradeSpecificTerms = {
      'ม.1': 'ภาพที่เข้าใจง่าย เหมาะสำหรับการเรียนรู้ขั้นพื้นฐาน',
      'ม.2': 'ภาพประกอบที่ช่วยเสริมสร้างความเข้าใจ',
      'ม.3': 'ภาพที่แสดงรายละเอียดและความสัมพันธ์ของแนวคิด',
      'ม.4': 'ภาพที่แสดงความซับซ้อนและการประยุกต์ใช้',
      'ม.5': 'ภาพที่เน้นการวิเคราะห์และการคิดเชิงระบบ',
      'ม.6': 'ภาพที่แสดงการสังเคราะห์และการคิดระดับสูง'
    };

    return `${description} - ${gradeSpecificTerms[gradeLevel]}`;
  }

  private static getFallbackSuggestions(request: ImageSuggestionRequest): EnhancedImageSuggestion[] {
    const { topic, gradeLevel } = request;
    const gradeConfig = this.GRADE_APPROPRIATENESS_MAP[gradeLevel];

    return [
      {
        id: `fallback-1-${Date.now()}`,
        title: `ภาพประกอบเรื่อง "${topic}"`,
        description: `ภาพประกอบพื้นฐานสำหรับเรื่อง ${topic}`,
        keywords: [topic, 'education', 'learning'],
        imageType: 'illustration',
        complexity: 'simple',
        educationalValue: gradeConfig.educationalThreshold,
        ageAppropriate: true,
        placement: 'inline',
        size: 'medium',
        alternativeText: `ภาพประกอบเรื่อง ${topic}`,
        relatedConcepts: ['general']
      },
      {
        id: `fallback-2-${Date.now()}`,
        title: `แผนภาพเรื่อง "${topic}"`,
        description: `แผนภาพอธิบายแนวคิดหลักของเรื่อง ${topic}`,
        keywords: [topic, 'diagram', 'concept'],
        imageType: 'diagram',
        complexity: gradeConfig.maxComplexity as any,
        educationalValue: gradeConfig.educationalThreshold,
        ageAppropriate: true,
        placement: 'section-start',
        size: 'large',
        alternativeText: `แผนภาพเรื่อง ${topic}`,
        relatedConcepts: ['concepts']
      },
      {
        id: `fallback-3-${Date.now()}`,
        title: `ตัวอย่างประกอบเรื่อง "${topic}"`,
        description: `ตัวอย่างในชีวิตประจำวันที่เกี่ยวข้องกับเรื่อง ${topic}`,
        keywords: [topic, 'example', 'daily life'],
        imageType: 'photo',
        complexity: 'simple',
        educationalValue: gradeConfig.educationalThreshold - 1,
        ageAppropriate: true,
        placement: 'inline',
        size: 'medium',
        alternativeText: `ตัวอย่างเรื่อง ${topic}`,
        relatedConcepts: ['examples']
      }
    ];
  }
}

export default ImageSuggestionService;