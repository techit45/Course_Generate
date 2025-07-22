import { 
  ContentTemplate, 
  ContentSpecs, 
  TimeDistribution, 
  DifficultyDistribution,
  ContentAmount,
  ExerciseAmount,
  GradeLevel
} from '@/types';

// Time distributions for 4-hour (240 minutes) teaching sessions
export const timeDistributions: Record<ContentAmount, TimeDistribution> = {
  'น้อย': {
    introduction: 15, // 36 minutes
    mainContent: 50,  // 120 minutes
    activities: 20,   // 48 minutes
    exercises: 10,    // 24 minutes
    summary: 5        // 12 minutes
  },
  'ปานกลาง': {
    introduction: 10, // 24 minutes
    mainContent: 55,  // 132 minutes
    activities: 20,   // 48 minutes
    exercises: 12,    // 29 minutes
    summary: 3        // 7 minutes
  },
  'มาก': {
    introduction: 8,  // 19 minutes
    mainContent: 60,  // 144 minutes
    activities: 18,   // 43 minutes
    exercises: 12,    // 29 minutes
    summary: 2        // 5 minutes
  }
};

// Difficulty distributions by grade level
export const difficultyDistributions: Record<GradeLevel, DifficultyDistribution> = {
  'ม.1': { easy: 60, medium: 35, hard: 5 },
  'ม.2': { easy: 50, medium: 40, hard: 10 },
  'ม.3': { easy: 40, medium: 45, hard: 15 },
  'ม.4': { easy: 30, medium: 50, hard: 20 },
  'ม.5': { easy: 25, medium: 50, hard: 25 },
  'ม.6': { easy: 20, medium: 50, hard: 30 }
};

// Content specifications by content amount
export const contentSpecs: Record<ContentAmount, ContentSpecs> = {
  'น้อย': {
    pageRange: [10, 15],
    sectionCount: [3, 4],
    exerciseCount: [5, 8],
    activityCount: [2, 3],
    timeDistribution: timeDistributions['น้อย'],
    difficultyDistribution: { easy: 50, medium: 40, hard: 10 }
  },
  'ปานกลาง': {
    pageRange: [20, 30],
    sectionCount: [5, 6],
    exerciseCount: [10, 15],
    activityCount: [3, 4],
    timeDistribution: timeDistributions['ปานกลาง'],
    difficultyDistribution: { easy: 40, medium: 45, hard: 15 }
  },
  'มาก': {
    pageRange: [35, 40],
    sectionCount: [7, 8],
    exerciseCount: [20, 25],
    activityCount: [4, 5],
    timeDistribution: timeDistributions['มาก'],
    difficultyDistribution: { easy: 30, medium: 50, hard: 20 }
  }
};

// Exercise count adjustments by exercise amount
export const exerciseAdjustments: Record<ExerciseAmount, number> = {
  'น้อย': 0.7,    // 70% of base count
  'ปานกลาง': 1.0, // 100% of base count
  'มาก': 1.5      // 150% of base count
};

// Content templates for different teaching approaches
export const contentTemplates: Record<string, ContentTemplate> = {
  'traditional': {
    id: 'traditional',
    name: 'แบบดั้งเดิม',
    description: 'การสอนแบบดั้งเดิม เน้นการบรรยายและฝึกปฏิบัติ',
    structure: [
      { type: 'theory', title: 'บทนำและความรู้พื้นฐาน', required: true, duration: 45, order: 1 },
      { type: 'explanation', title: 'การอธิบายแนวคิดหลัก', required: true, duration: 60, order: 2 },
      { type: 'example', title: 'ตัวอย่างและการประยุกต์', required: true, duration: 45, order: 3 },
      { type: 'practice', title: 'การฝึกปฏิบัติ', required: true, duration: 60, order: 4 },
      { type: 'summary', title: 'สรุปและทบทวน', required: true, duration: 30, order: 5 }
    ],
    specs: contentSpecs['ปานกลาง'],
    timeAllocation: timeDistributions['ปานกลาง']
  },
  'interactive': {
    id: 'interactive',
    name: 'แบบมีส่วนร่วม',
    description: 'การสอนแบบมีส่วนร่วม เน้นกิจกรรมและการปฏิสัมพันธ์',
    structure: [
      { type: 'theory', title: 'การแนะนำหัวข้อ', required: true, duration: 30, order: 1 },
      { type: 'explanation', title: 'การสำรวจแนวคิด', required: true, duration: 45, order: 2 },
      { type: 'practice', title: 'กิจกรรมกลุ่ม', required: true, duration: 75, order: 3 },
      { type: 'example', title: 'การนำเสนอผลงาน', required: true, duration: 60, order: 4 },
      { type: 'summary', title: 'การสะท้อนและสรุป', required: true, duration: 30, order: 5 }
    ],
    specs: contentSpecs['ปานกลาง'],
    timeAllocation: timeDistributions['ปานกลาง']
  },
  'inquiry': {
    id: 'inquiry',
    name: 'แบบสืบเสาะหาความรู้',
    description: 'การสอนแบบสืบเสาะหาความรู้ เน้นการค้นพบด้วยตนเอง',
    structure: [
      { type: 'theory', title: 'การตั้งคำถามและสมมติฐาน', required: true, duration: 35, order: 1 },
      { type: 'practice', title: 'การสำรวจและทดลอง', required: true, duration: 80, order: 2 },
      { type: 'explanation', title: 'การวิเคราะห์ข้อมูล', required: true, duration: 60, order: 3 },
      { type: 'example', title: 'การสรุปและอภิปราย', required: true, duration: 45, order: 4 },
      { type: 'summary', title: 'การประยุกต์ใช้', required: true, duration: 20, order: 5 }
    ],
    specs: contentSpecs['มาก'],
    timeAllocation: timeDistributions['มาก']
  }
};

// Teaching phase templates for 4-hour sessions
export const teachingPhaseTemplates = {
  'opening': {
    name: 'เปิดบทเรียน',
    duration: 20,
    type: 'introduction' as const,
    activities: [
      'ทักทายและเช็คชื่อ',
      'ทบทวนบทเรียนที่แล้ว',
      'แนะนำหัวข้อใหม่',
      'ตั้งวัตถุประสงค์การเรียนรู้'
    ]
  },
  'warmup': {
    name: 'กิจกรรมอุ่นเครื่อง',
    duration: 15,
    type: 'activity' as const,
    activities: [
      'เกมทบทวนความรู้',
      'การระดมสมอง',
      'คำถามกระตุ้นความสนใจ'
    ]
  },
  'presentation': {
    name: 'นำเสนอเนื้อหา',
    duration: 60,
    type: 'explanation' as const,
    activities: [
      'บรรยายพร้อมสื่อประกอบ',
      'การสาธิต',
      'การยกตัวอย่าง',
      'การตั้งคำถามระหว่างการสอน'
    ]
  },
  'practice': {
    name: 'ฝึกปฏิบัติ',
    duration: 45,
    type: 'practice' as const,
    activities: [
      'การฝึกปฏิบัติเป็นรายบุคคล',
      'การทำงานเป็นคู่',
      'การแก้ปัญหาร่วมกัน'
    ]
  },
  'groupwork': {
    name: 'กิจกรรมกลุ่ม',
    duration: 40,
    type: 'activity' as const,
    activities: [
      'การทำงานกลุ่มเล็ก',
      'การอภิปรายกลุ่ม',
      'การนำเสนอผลงาน'
    ]
  },
  'assessment': {
    name: 'การประเมินผล',
    duration: 30,
    type: 'assessment' as const,
    activities: [
      'แบบทดสอบย่อย',
      'การตรวจสอบความเข้าใจ',
      'การให้ผลป้อนกลับ'
    ]
  },
  'closure': {
    name: 'ปิดบทเรียน',
    duration: 20,
    type: 'summary' as const,
    activities: [
      'สรุปประเด็นสำคัญ',
      'เชื่อมโยงกับบทเรียนถัดไป',
      'มอบหมายงาน',
      'ตอบคำถาม'
    ]
  }
};

// Get content specifications based on user inputs
export const getContentSpecification = (
  contentAmount: ContentAmount,
  exerciseAmount: ExerciseAmount,
  gradeLevel: GradeLevel
): ContentSpecs => {
  const baseSpecs = contentSpecs[contentAmount];
  const exerciseMultiplier = exerciseAdjustments[exerciseAmount];
  const gradeDifficulty = difficultyDistributions[gradeLevel];

  return {
    ...baseSpecs,
    exerciseCount: [
      Math.floor(baseSpecs.exerciseCount[0] * exerciseMultiplier),
      Math.floor(baseSpecs.exerciseCount[1] * exerciseMultiplier)
    ],
    difficultyDistribution: gradeDifficulty
  };
};

// Generate time allocation for specific content
export const calculateTimeAllocation = (
  contentAmount: ContentAmount,
  totalMinutes: number = 240
): Record<string, number> => {
  const distribution = timeDistributions[contentAmount];
  
  return {
    introduction: Math.floor(totalMinutes * distribution.introduction / 100),
    mainContent: Math.floor(totalMinutes * distribution.mainContent / 100),
    activities: Math.floor(totalMinutes * distribution.activities / 100),
    exercises: Math.floor(totalMinutes * distribution.exercises / 100),
    summary: Math.floor(totalMinutes * distribution.summary / 100)
  };
};