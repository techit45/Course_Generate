import { useState, useEffect, useMemo } from 'react';
import { StudySheetForm, GradeLevel, ContentAmount, ExerciseAmount } from '@/types';
import { getContentSpecification, calculateTimeAllocation } from '@/config/contentTemplates';
// import { generateContentStructure } from '@/services/contentGenerator';

interface PreviewData {
  isValid: boolean;
  estimatedPages: number;
  estimatedDuration: number;
  sectionCount: number;
  exerciseCount: number;
  activityCount: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  timeAllocation: {
    introduction: number;
    mainContent: number;
    activities: number;
    exercises: number;
    summary: number;
  };
  contentStructure: {
    title: string;
    sections: Array<{
      title: string;
      type: string;
      duration: number;
      description: string;
    }>;
    exerciseTypes: Array<{
      type: string;
      count: number;
      difficulty: string;
    }>;
    activities: Array<{
      title: string;
      type: string;
      duration: number;
    }>;
  };
  gradeInfo: {
    level: string;
    ageRange: string;
    complexity: string;
    vocabulary: string;
  };
}

export const useRealtimePreview = (formData: Partial<StudySheetForm>) => {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  
  // Debounced update to prevent excessive calculations
  const [debouncedFormData, setDebouncedFormData] = useState(formData);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFormData(formData);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [formData]);

  const preview = useMemo(() => {
    if (!debouncedFormData.topic || !debouncedFormData.gradeLevel || 
        !debouncedFormData.contentAmount || !debouncedFormData.exerciseAmount) {
      return null;
    }

    try {
      const specs = getContentSpecification(
        debouncedFormData.contentAmount || 'ปานกลาง',
        debouncedFormData.exerciseAmount || 'ปานกลาง',
        debouncedFormData.gradeLevel || 'ม.1'
      );

      const timeAllocation = calculateTimeAllocation(debouncedFormData.contentAmount || 'ปานกลาง');
      const totalDuration = Object.values(timeAllocation).reduce((sum, time) => sum + time, 0);

      // Generate preview sections using specs directly
      const sectionTitles = generateSectionTitles(
        debouncedFormData.topic || '', 
        debouncedFormData.gradeLevel || 'ม.1',
        specs.sectionCount[0]
      );

      const exerciseTypes = generateExercisePreview(
        specs.exerciseCount[0],
        specs.difficultyDistribution
      );

      const activities = generateActivityPreview(
        debouncedFormData.topic || '',
        specs.activityCount[0]
      );

      return {
        isValid: true,
        estimatedPages: Math.floor((specs.pageRange[0] + specs.pageRange[1]) / 2),
        estimatedDuration: totalDuration,
        sectionCount: specs.sectionCount[0],
        exerciseCount: specs.exerciseCount[0],
        activityCount: specs.activityCount[0],
        difficultyDistribution: specs.difficultyDistribution,
        timeAllocation: {
          introduction: timeAllocation.introduction || 0,
          mainContent: timeAllocation.mainContent || 0,
          activities: timeAllocation.activities || 0,
          exercises: timeAllocation.exercises || 0,
          summary: timeAllocation.summary || 0,
        },
        contentStructure: {
          title: `ชีทเรียนเรื่อง ${debouncedFormData.topic || 'หัวข้อการเรียน'}`,
          sections: sectionTitles,
          exerciseTypes,
          activities
        },
        gradeInfo: getGradeInfo(debouncedFormData.gradeLevel || 'ม.1')
      };
    } catch (error) {
      console.error('Preview generation error:', error);
      return null;
    }
  }, [debouncedFormData]);

  useEffect(() => {
    setPreviewData(preview);
  }, [preview]);

  return previewData;
};

// Helper functions for generating preview content
const generateSectionTitles = (
  topic: string, 
  gradeLevel: GradeLevel, 
  sectionCount: number
) => {
  const commonSections = [
    {
      title: `บทนำ: ${topic} คืออะไร?`,
      type: 'theory',
      duration: 25,
      description: 'แนะนำแนวคิดพื้นฐานและความสำคัญ'
    },
    {
      title: `หลักการและทฤษฎีของ ${topic}`,
      type: 'explanation',
      duration: 35,
      description: 'อธิบายหลักการสำคัญและทฤษฎีที่เกี่ยวข้อง'
    },
    {
      title: `ตัวอย่างการประยุกต์ใช้ ${topic}`,
      type: 'example',
      duration: 30,
      description: 'ยกตัวอย่างการใช้งานในชีวิตจริง'
    },
    {
      title: `การฝึกปฏิบัติ ${topic}`,
      type: 'practice',
      duration: 40,
      description: 'แบบฝึกหัดและกิจกรรมการเรียนรู้'
    },
    {
      title: `การประเมินผลและทบทวน ${topic}`,
      type: 'summary',
      duration: 20,
      description: 'สรุปและประเมินความเข้าใจ'
    }
  ];

  // Adjust complexity based on grade level
  const gradeAdjustments: Record<GradeLevel, string> = {
    'ม.1': 'เบื้องต้น',
    'ม.2': 'พื้นฐาน',
    'ม.3': 'ระดับกลาง',
    'ม.4': 'ระดับสูง',
    'ม.5': 'ขั้นสูง',
    'ม.6': 'เชี่ยวชาญ'
  };

  return commonSections.slice(0, sectionCount).map((section, index) => ({
    ...section,
    title: index === 0 
      ? `${section.title} (ระดับ${gradeAdjustments[gradeLevel]})`
      : section.title
  }));
};

const generateExercisePreview = (
  exerciseCount: number,
  difficultyDistribution: { easy: number; medium: number; hard: number }
) => {
  const exerciseTypes = [
    { type: 'multiple-choice', name: 'ปรนัย', weight: 0.4 },
    { type: 'short-answer', name: 'อัตนัย', weight: 0.3 },
    { type: 'essay', name: 'เรียงความ', weight: 0.2 },
    { type: 'true-false', name: 'ถูก/ผิด', weight: 0.1 }
  ];

  const difficulties = ['easy', 'medium', 'hard'] as const;
  const difficultyNames = { easy: 'ง่าย', medium: 'ปานกลาง', hard: 'ยาก' };

  return exerciseTypes.map(type => {
    const count = Math.ceil(exerciseCount * type.weight);
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    
    return {
      type: type.name,
      count,
      difficulty: difficultyNames[difficulty]
    };
  });
};

const generateActivityPreview = (topic: string, activityCount: number) => {
  const activityTemplates = [
    {
      title: `การอภิปรายกลุ่มเรื่อง ${topic}`,
      type: 'group',
      duration: 30
    },
    {
      title: `การนำเสนอโครงงาน ${topic}`,
      type: 'demonstration',
      duration: 45
    },
    {
      title: `เกมการเรียนรู้ ${topic}`,
      type: 'individual',
      duration: 25
    },
    {
      title: `การสำรวจและค้นคว้า ${topic}`,
      type: 'group',
      duration: 40
    }
  ];

  return activityTemplates.slice(0, activityCount);
};

const getGradeInfo = (gradeLevel: GradeLevel) => {
  const gradeData: Record<GradeLevel, { ageRange: string; complexity: string; vocabulary: string }> = {
    'ม.1': {
      ageRange: '12-13 ปี',
      complexity: 'ระดับพื้นฐาน เน้นความเข้าใจเบื้องต้น',
      vocabulary: 'คำศัพท์ง่าย หลีกเลี่ยงศัพท์เทคนิค'
    },
    'ม.2': {
      ageRange: '13-14 ปี',
      complexity: 'ระดับกลาง เพิ่มความซับซ้อนขึ้นเล็กน้อย',
      vocabulary: 'คำศัพท์ระดับกลาง เริ่มแนะนำศัพท์เทคนิค'
    },
    'ม.3': {
      ageRange: '14-15 ปี',
      complexity: 'ระดับกลางถึงสูง เน้นการวิเคราะห์',
      vocabulary: 'คำศัพท์ระดับกลางถึงสูง ใช้ศัพท์เทคนิค'
    },
    'ม.4': {
      ageRange: '15-16 ปี',
      complexity: 'ระดับสูง เน้นการคิดเชิงนามธรรม',
      vocabulary: 'คำศัพท์ระดับสูง ศัพท์เทคนิคและวิชาการ'
    },
    'ม.5': {
      ageRange: '16-17 ปี',
      complexity: 'ระดับสูงมาก เตรียมสู่อุดมศึกษา',
      vocabulary: 'คำศัพท์ระดับสูง ศัพท์วิชาการขั้นสูง'
    },
    'ม.6': {
      ageRange: '17-18 ปี',
      complexity: 'ระดับสูงสุด เตรียมสอบเข้ามหาวิทยาลัย',
      vocabulary: 'คำศัพท์ระดับมหาวิทยาลัย ศัพท์วิชาการขั้นสูง'
    }
  };

  return {
    level: gradeLevel,
    ...gradeData[gradeLevel]
  };
};