// Fallback Content Generation Service for GenCouce
// Used when AI services fail or are unavailable

import { StudySheetContent, StudySheetForm, GradeLevel, ContentAmount, ExerciseAmount } from '@/types';

export interface FallbackContentOptions {
  includeExercises?: boolean;
  includeActivities?: boolean;
  useBasicStructure?: boolean;
  customizeForGrade?: boolean;
}

// Content templates based on grade level and subject
const CONTENT_TEMPLATES = {
  // Basic subject patterns
  subjects: {
    'คณิตศาสตร์': {
      objectives: [
        'เข้าใจแนวคิดพื้นฐานของหัวข้อ',
        'สามารถคำนวณและแก้โจทย์ปัญหาได้',
        'นำความรู้ไปประยุกต์ใช้ในชีวิตประจำวัน'
      ],
      keyTerms: ['จำนวน', 'การคำนวณ', 'สูตร', 'ปัญหา', 'วิธีการ'],
      activities: ['การคำนวณ', 'การแก้โจทย์', 'การฝึกปฏิบัติ']
    },
    'วิทยาศาสตร์': {
      objectives: [
        'อธิบายหลักการและทฤษฎีพื้นฐานได้',
        'สังเกตและทดลองเพื่อค้นหาคำตอบ',
        'เชื่อมโยงความรู้กับปรากฏการณ์ธรรมชาติ'
      ],
      keyTerms: ['การทดลอง', 'สังเกต', 'ทฤษฎี', 'ปรากฏการณ์', 'วิเคราะห์'],
      activities: ['การทดลอง', 'การสังเกต', 'การอภิปราย']
    },
    'ภาษาไทย': {
      objectives: [
        'อ่านและเข้าใจเนื้อหาได้อย่างถูกต้อง',
        'เขียนสื่อสารได้อย่างชัดเจน',
        'นำภาษาไปใช้ในชีวิตประจำวันได้เหมาะสม'
      ],
      keyTerms: ['การอ่าน', 'การเขียน', 'ไวยากรณ์', 'การสื่อสาร', 'วรรณกรรม'],
      activities: ['การอ่าน', 'การเขียน', 'การนำเสนอ']
    },
    'สังคมศึกษา': {
      objectives: [
        'เข้าใจความสำคัญของเรื่องที่ศึกษา',
        'วิเคราะห์และเชื่อมโยงเหตุการณ์ได้',
        'นำความรู้ไปใช้เป็นพลเมืองดี'
      ],
      keyTerms: ['สังคม', 'ประวัติศาสตร์', 'ภูมิศาสตร์', 'การเมือง', 'วัฒนธรรม'],
      activities: ['การศึกษาค้นคว้า', 'การอภิปราย', 'การนำเสนอ']
    }
  },

  // Grade-specific adjustments
  gradeAdjustments: {
    'ม.1': { complexity: 'basic', vocabulary: 'simple', examples: 'concrete' },
    'ม.2': { complexity: 'basic', vocabulary: 'simple', examples: 'concrete' },
    'ม.3': { complexity: 'intermediate', vocabulary: 'moderate', examples: 'mixed' },
    'ม.4': { complexity: 'intermediate', vocabulary: 'moderate', examples: 'abstract' },
    'ม.5': { complexity: 'advanced', vocabulary: 'complex', examples: 'abstract' },
    'ม.6': { complexity: 'advanced', vocabulary: 'complex', examples: 'analytical' }
  },

  // Exercise templates
  exerciseTemplates: {
    'multiple-choice': {
      easy: ['ข้อใดถูกต้อง', 'จงเลือกคำตอบที่ถูกต้อง', 'ข้อใดเป็นตัวอย่างของ'],
      medium: ['จากข้อมูลที่กำหนด จงหา', 'จงเปรียบเทียบ', 'จงวิเคราะห์'],
      hard: ['จงประเมินและสรุป', 'จากกรณีศึกษา จงแสดงความคิดเห็น']
    },
    'short-answer': {
      easy: ['อธิบายความหมายของ', 'ยกตัวอย่าง', 'เขียนสูตรของ'],
      medium: ['อธิบายการทำงานของ', 'เปรียบเทียบความแตกต่าง', 'วิเคราะห์สาเหตุ'],
      hard: ['ประเมินผลกระทบของ', 'เสนอแนวทางแก้ไข', 'สรุปและให้ความเห็น']
    }
  }
};

export class FallbackContentGenerator {
  private static instance: FallbackContentGenerator;

  static getInstance(): FallbackContentGenerator {
    if (!FallbackContentGenerator.instance) {
      FallbackContentGenerator.instance = new FallbackContentGenerator();
    }
    return FallbackContentGenerator.instance;
  }

  // Generate complete fallback content
  generateFallbackContent(
    formData: StudySheetForm,
    options: FallbackContentOptions = {}
  ): StudySheetContent {
    const {
      includeExercises = true,
      includeActivities = true,
      useBasicStructure = false,
      customizeForGrade = true
    } = options;

    const topic = formData.topic || 'หัวข้อการเรียนรู้';
    const subjectType = this.identifySubjectType(topic);
    const gradeInfo = CONTENT_TEMPLATES.gradeAdjustments[formData.gradeLevel];

    return {
      title: `ชีทเรียนเรื่อง ${topic}`,
      
      objectives: this.generateObjectives(subjectType, gradeInfo, customizeForGrade),
      
      mainContent: this.generateMainContent(
        topic,
        formData.contentAmount,
        subjectType,
        gradeInfo,
        useBasicStructure
      ),
      
      exercises: includeExercises 
        ? this.generateExercises(formData.exerciseAmount, subjectType, gradeInfo)
        : [],
      
      activities: includeActivities 
        ? this.generateActivities(subjectType, gradeInfo)
        : [],
      
      summary: this.generateSummary(topic, subjectType),
      
      images: this.generateImageSuggestions(topic, subjectType),
      
      metadata: this.generateMetadata(formData, includeExercises, includeActivities)
    };
  }

  private identifySubjectType(topic: string): string {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('คณิต') || topicLower.includes('พีช') || 
        topicLower.includes('เรขา') || topicLower.includes('เลข')) {
      return 'คณิตศาสตร์';
    } else if (topicLower.includes('วิทยา') || topicLower.includes('ฟิสิกส์') || 
               topicLower.includes('เคมี') || topicLower.includes('ชีววิทยา')) {
      return 'วิทยาศาสตร์';
    } else if (topicLower.includes('ไทย') || topicLower.includes('ภาษา') || 
               topicLower.includes('วรรณ')) {
      return 'ภาษาไทย';
    } else if (topicLower.includes('สังคม') || topicLower.includes('ประวัติ') || 
               topicLower.includes('ภูมิ')) {
      return 'สังคมศึกษา';
    }
    
    return 'คณิตศาสตร์'; // default
  }

  private generateObjectives(
    subjectType: string,
    gradeInfo: any,
    customizeForGrade: boolean
  ): string[] {
    const baseObjectives = (CONTENT_TEMPLATES.subjects as any)[subjectType]?.objectives || 
                          CONTENT_TEMPLATES.subjects['คณิตศาสตร์'].objectives;
    
    if (!customizeForGrade) {
      return [...baseObjectives];
    }

    // Adjust complexity based on grade level
    return baseObjectives.map((objective: string) => {
      if (gradeInfo.complexity === 'basic') {
        return objective.replace('วิเคราะห์', 'เข้าใจ').replace('ประยุกต์', 'ใช้');
      } else if (gradeInfo.complexity === 'advanced') {
        return objective.replace('เข้าใจ', 'วิเคราะห์').replace('ใช้', 'ประยุกต์และสร้างสรรค์');
      }
      return objective;
    });
  }

  private generateMainContent(
    topic: string,
    contentAmount: ContentAmount,
    subjectType: string,
    gradeInfo: any,
    useBasicStructure: boolean
  ): any[] {
    const sectionCount = contentAmount === 'น้อย' ? 3 : contentAmount === 'ปานกลาง' ? 4 : 6;
    const sections = [];
    const keyTerms = (CONTENT_TEMPLATES.subjects as any)[subjectType]?.keyTerms || [];

    for (let i = 0; i < sectionCount; i++) {
      const section = {
        id: `section-${i + 1}`,
        title: this.generateSectionTitle(topic, i + 1, sectionCount),
        type: this.getSectionType(i, sectionCount),
        content: this.generateSectionContent(topic, i + 1, gradeInfo, useBasicStructure),
        duration: this.calculateSectionDuration(contentAmount),
        keyTerms: keyTerms.slice(0, 3),
        noteSpace: true
      };
      
      sections.push(section);
    }

    return sections;
  }

  private generateSectionTitle(topic: string, sectionIndex: number, totalSections: number): string {
    const titles = [
      `ความรู้พื้นฐานเกี่ยวกับ${topic}`,
      `หลักการและแนวคิดของ${topic}`,
      `การประยุกต์ใช้${topic}`,
      `ตัวอย่างและกรณีศึกษา`,
      `การแก้ปัญหาและการวิเคราะห์`,
      `สรุปและการนำไปใช้`
    ];
    
    return titles[sectionIndex - 1] || `หัวข้อที่ ${sectionIndex}`;
  }

  private getSectionType(index: number, total: number): string {
    const types = ['theory', 'explanation', 'example', 'practice', 'summary'];
    return types[index % types.length];
  }

  private generateSectionContent(
    topic: string,
    sectionIndex: number,
    gradeInfo: any,
    useBasicStructure: boolean
  ): string {
    if (useBasicStructure) {
      return `เนื้อหาเกี่ยวกับ ${topic} ในหัวข้อนี้จะครอบคลุมแนวคิดพื้นฐานและการประยุกต์ใช้ที่เหมาะสมกับระดับชั้นมัธยมศึกษา นักเรียนจะได้เรียนรู้ผ่านตัวอย่างและแบบฝึกหัดที่หลากหlaย`;
    }

    const complexityText = gradeInfo.complexity === 'basic' 
      ? 'แนวคิดพื้นฐาน' 
      : gradeInfo.complexity === 'intermediate' 
      ? 'หลักการและการประยุกต์' 
      : 'การวิเคราะห์เชิงลึกและการสร้างสรรค์';

    return `เนื้อหาในส่วนนี้จะเน้น${complexityText}เกี่ยวกับ ${topic} โดยนักเรียนจะได้เรียนรู้ผ่านการอธิบายที่ชัดเจน ตัวอย่างที่เข้าใจง่าย และการฝึกปฏิบัติที่เหมาะสมกับระดับชั้น นอกจากนี้ยังมีการเชื่อมโยงกับชีวิตประจำวันเพื่อให้นักเรียนเห็นความสำคัญและประโยชน์ของการเรียนรู้`;
  }

  private calculateSectionDuration(contentAmount: ContentAmount): number {
    const baseDuration = contentAmount === 'น้อย' ? 25 : contentAmount === 'ปานกลาง' ? 30 : 35;
    return baseDuration + Math.floor(Math.random() * 10) - 5; // Add some variation
  }

  private generateExercises(
    exerciseAmount: ExerciseAmount,
    subjectType: string,
    gradeInfo: any
  ): any[] {
    const exerciseCount = exerciseAmount === 'น้อย' ? 5 : exerciseAmount === 'ปานกลาง' ? 10 : 15;
    const exercises = [];

    for (let i = 0; i < exerciseCount; i++) {
      const difficulty = this.getDifficultyForGrade(gradeInfo.complexity, i, exerciseCount);
      const type = i % 3 === 0 ? 'multiple-choice' : 'short-answer';
      
      const exercise = {
        id: `exercise-${i + 1}`,
        question: this.generateExerciseQuestion(type, difficulty, subjectType),
        type,
        difficulty,
        points: difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 5,
        answerSpace: type === 'short-answer' ? 3 : 1,
        options: type === 'multiple-choice' ? this.generateMultipleChoiceOptions() : undefined
      };
      
      exercises.push(exercise);
    }

    return exercises;
  }

  private getDifficultyForGrade(gradeComplexity: string, index: number, total: number): string {
    if (gradeComplexity === 'basic') {
      return index < total * 0.7 ? 'easy' : 'medium';
    } else if (gradeComplexity === 'advanced') {
      return index < total * 0.3 ? 'easy' : index < total * 0.7 ? 'medium' : 'hard';
    }
    return index < total * 0.4 ? 'easy' : index < total * 0.8 ? 'medium' : 'hard';
  }

  private generateExerciseQuestion(type: string, difficulty: string, subjectType: string): string {
    const templates = (CONTENT_TEMPLATES.exerciseTemplates as any)[type]?.[difficulty] || 
                     CONTENT_TEMPLATES.exerciseTemplates['short-answer']['easy'];
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    const subjectTerms = (CONTENT_TEMPLATES.subjects as any)[subjectType]?.keyTerms || ['หัวข้อนี้'];
    const term = subjectTerms[Math.floor(Math.random() * subjectTerms.length)];
    
    return `${template}${term}`;
  }

  private generateMultipleChoiceOptions(): string[] {
    return [
      'ตัวเลือกที่ 1 (คำตอบที่ถูกต้อง)',
      'ตัวเลือกที่ 2',
      'ตัวเลือกที่ 3',
      'ตัวเลือกที่ 4'
    ];
  }

  private generateActivities(subjectType: string, gradeInfo: any): any[] {
    const baseActivities = (CONTENT_TEMPLATES.subjects as any)[subjectType]?.activities || 
                          CONTENT_TEMPLATES.subjects['คณิตศาสตร์'].activities;
    
    return baseActivities.map((activity: string, index: number) => ({
      id: `activity-${index + 1}`,
      title: `กิจกรรม${activity}`,
      type: index % 2 === 0 ? 'individual' : 'group',
      duration: 15 + (index * 5),
      description: `กิจกรรม${activity}ที่เหมาะสมกับระดับชั้น เน้นการมีส่วนร่วมและการเรียนรู้จากประสบการณ์ตรง`,
      instructions: [
        'เตรียมวัสดุและอุปกรณ์ที่จำเป็น',
        'ทำความเข้าใจขั้นตอนการทำกิจกรรม',
        'ปฏิบัติตามขั้นตอนอย่างระมัดระวัง',
        'บันทึกผลการสังเกตและสรุปผล'
      ],
      materials: ['กระดาษ', 'ปากกา', 'อุปกรณ์เฉพาะกิจกรรม']
    }));
  }

  private generateSummary(topic: string, subjectType: string): string {
    return `จากการเรียนรู้เรื่อง ${topic} นักเรียนจะได้รับความรู้และทักษะที่สำคัญสำหรับการศึกษาในระดับที่สูงขึ้น เนื้อหานี้เป็นพื้นฐานสำคัญที่จะช่วยให้นักเรียนสามารถเชื่อมโยงกับความรู้อื่น ๆ และนำไปประยุกต์ใช้ในชีวิตประจำวันได้อย่างมีประสิทธิภาพ`;
  }

  private generateImageSuggestions(topic: string, subjectType: string): any[] {
    const suggestions = [
      {
        id: `img-1`,
        description: `แผนภาพแสดงแนวคิดหลักของ ${topic}`,
        keywords: ['แผนภาพ', 'แนวคิด', topic],
        suggestedSource: 'diagram'
      },
      {
        id: `img-2`,
        description: `ตัวอย่างการประยุกต์ใช้ ${topic} ในชีวิตประจำวัน`,
        keywords: ['ตัวอย่าง', 'ประยุกต์', topic],
        suggestedSource: 'real-world'
      }
    ];

    return suggestions;
  }

  private generateMetadata(
    formData: StudySheetForm,
    includeExercises: boolean,
    includeActivities: boolean
  ): any {
    const basePages = formData.contentAmount === 'น้อย' ? 8 : 
                     formData.contentAmount === 'ปานกลาง' ? 12 : 16;
    
    const exerciseCount = includeExercises 
      ? (formData.exerciseAmount === 'น้อย' ? 5 : 
         formData.exerciseAmount === 'ปานกลาง' ? 10 : 15)
      : 0;

    const activityCount = includeActivities ? 3 : 0;
    const sectionCount = formData.contentAmount === 'น้อย' ? 3 : 
                        formData.contentAmount === 'ปานกลาง' ? 4 : 6;

    return {
      pageCount: basePages,
      totalDuration: 240, // 4 hours in minutes
      sectionCount,
      exerciseCount,
      activityCount,
      difficultyLevel: formData.gradeLevel,
      generated: 'fallback',
      generatedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Generate minimal emergency content
  generateEmergencyContent(topic: string = 'หัวข้อการเรียน'): StudySheetContent {
    return {
      title: `ชีทเรียนเรื่อง ${topic}`,
      
      objectives: [
        `เข้าใจแนวคิดพื้นฐานของ ${topic}`,
        `สามารถอธิบายความสำคัญของ ${topic} ได้`,
        `นำความรู้เกี่ยวกับ ${topic} ไปใช้ในชีวิตประจำวัน`
      ],
      
      mainContent: [
        {
          id: 'emergency-section-1',
          title: `ความรู้เบื้องต้นเกี่ยวกับ ${topic}`,
          type: 'theory',
          content: `เนื้อหาเกี่ยวกับ ${topic} ที่นักเรียนจะได้เรียนรู้ในชั้นเรียนนี้ ครอบคลุมแนวคิดพื้นฐานและการประยุกต์ใช้ที่สำคัญ`,
          duration: 30,
          keyTerms: [topic, 'แนวคิด', 'ประยุกต์'],
          noteSpace: true
        }
      ],
      
      exercises: [
        {
          id: 'emergency-exercise-1',
          question: `อธิบายความสำคัญของ ${topic}`,
          type: 'short-answer',
          difficulty: 'easy',
          points: 5,
          answerSpace: 3
        }
      ],
      
      activities: [
        {
          id: 'emergency-activity-1',
          title: `กิจกรรมศึกษา ${topic}`,
          type: 'individual',
          duration: 20,
          description: `กิจกรรมการเรียนรู้เกี่ยวกับ ${topic} แบบรายบุคคล`,
          instructions: ['อ่านเนื้อหา', 'ทำความเข้าใจ', 'สรุปประเด็นสำคัญ'],
          materials: ['หนังสือ', 'กระดาษ', 'ปากกา'],
          expectedOutcome: `นักเรียนสามารถเข้าใจพื้นฐาน ${topic} ได้`
        }
      ],
      
      summary: `การเรียนรู้เรื่อง ${topic} เป็นพื้นฐานสำคัญที่นักเรียนจะนำไปใช้ในการศึกษาต่อ`,
      
      images: [],
      
      metadata: {
        pageCount: 4,
        totalDuration: 60,
        sectionCount: 1,
        exerciseCount: 1,
        activityCount: 1,
        difficultyLevel: 'ม.1',
        contentType: 'emergency',
        generatedAt: new Date()
      }
    };
  }
}

// Export singleton instance
export const fallbackContentGenerator = FallbackContentGenerator.getInstance();