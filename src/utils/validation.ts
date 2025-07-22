import { FormValidationRules } from '@/types';

// Validation rules for the study sheet form
export const studySheetValidationRules: FormValidationRules = {
  topic: {
    required: 'กรุณากรอกหัวข้อการเรียน',
    minLength: {
      value: 3,
      message: 'หัวข้อต้องมีอย่างน้อย 3 ตัวอักษร'
    },
    maxLength: {
      value: 100,
      message: 'หัวข้อต้องไม่เกิน 100 ตัวอักษร'
    },
    pattern: {
      value: /^[ก-๙a-zA-Z0-9\s\-\(\)\[\]\{\}\.\,\!\?\:\;]+$/,
      message: 'หัวข้อมีอักขระที่ไม่ถูกต้อง'
    }
  },
  gradeLevel: {
    required: 'กรุณาเลือกระดับชั้น'
  },
  contentAmount: {
    required: 'กรุณาเลือกปริมาณเนื้อหา'
  },
  exerciseAmount: {
    required: 'กรุณาเลือกปริมาณแบบฝึกหัด'
  }
};

// Custom validation functions
export const customValidations = {
  // Check if topic contains inappropriate content
  isTopicAppropriate: (topic: string): boolean => {
    const inappropriateWords = ['test', 'spam', 'xxx']; // Add more as needed
    return !inappropriateWords.some(word => 
      topic.toLowerCase().includes(word.toLowerCase())
    );
  },

  // Check if topic is educational
  isEducationalTopic: (topic: string): boolean => {
    const educationalKeywords = [
      'คณิตศาสตร์', 'วิทยาศาสตร์', 'ฟิสิกส์', 'เคมี', 'ชีววิทยา',
      'ภาษาไทย', 'ภาษาอังกฤษ', 'สังคมศึกษา', 'ประวัติศาสตร์',
      'ภูมิศาสตร์', 'พีชคณิต', 'เรขาคณิต', 'แคลคูลัส', 'สถิติ',
      'mathematics', 'science', 'physics', 'chemistry', 'biology',
      'english', 'history', 'geography', 'algebra', 'geometry'
    ];
    
    // If topic is very short, we'll be lenient
    if (topic.length < 10) return true;
    
    return educationalKeywords.some(keyword => 
      topic.toLowerCase().includes(keyword.toLowerCase())
    );
  }
};

// Form validation messages in Thai
export const validationMessages = {
  required: (field: string) => `กรุณากรอก${field}`,
  minLength: (field: string, min: number) => `${field}ต้องมีอย่างน้อย ${min} ตัวอักษร`,
  maxLength: (field: string, max: number) => `${field}ต้องไม่เกิน ${max} ตัวอักษร`,
  invalid: (field: string) => `${field}ไม่ถูกต้อง`,
  inappropriate: 'หัวข้อไม่เหมาะสม กรุณาเลือกหัวข้อที่เกี่ยวข้องกับการศึกษา',
  notEducational: 'กรุณากรอกหัวข้อที่เกี่ยวข้องกับการศึกษา'
};

// Helper function to get field display name in Thai
export const getFieldDisplayName = (field: string): string => {
  const fieldNames: Record<string, string> = {
    topic: 'หัวข้อการเรียน',
    gradeLevel: 'ระดับชั้น',
    contentAmount: 'ปริมาณเนื้อหา',
    exerciseAmount: 'ปริมาณแบบฝึกหัด'
  };
  return fieldNames[field] || field;
};