import { GradeLevelPrompts, PromptTemplate, GradeLevel, ContentAmount, ExerciseAmount } from '@/types';

// Grade-specific educational guidelines
export const gradeLevelPrompts: GradeLevelPrompts = {
  'ม.1': {
    complexity: 'ระดับพื้นฐาน เหมาะสำหรับนักเรียนอายุ 12-13 ปี ใช้คำศัพท์ง่าย แนวคิดเบื้องต้น',
    vocabulary: 'ใช้คำศัพท์ระดับพื้นฐาน หลีกเลี่ยงศัพท์เทคนิคที่ซับซ้อน',
    examples: 'ยกตัวอย่างจากชีวิตประจำวัน สิ่งที่นักเรียนคุ้นเคย',
    exercises: 'แบบฝึกหัดระดับง่าย เน้นความเข้าใจพื้นฐาน'
  },
  'ม.2': {
    complexity: 'ระดับกลาง เหมาะสำหรับนักเรียนอายุ 13-14 ปี เพิ่มความซับซ้อนขึ้นเล็กน้อย',
    vocabulary: 'ใช้คำศัพท์ระดับกลาง เริ่มแนะนำศัพท์เทคนิคเบื้องต้น',
    examples: 'ตัวอย่างที่หลากหลายขึ้น รวมถึงการประยุกต์ใช้',
    exercises: 'แบบฝึกหัดระดับกลาง เน้นการประยุกต์ใช้'
  },
  'ม.3': {
    complexity: 'ระดับกลางถึงสูง เหมาะสำหรับนักเรียนอายุ 14-15 ปี เน้นการวิเคราะห์',
    vocabulary: 'ใช้คำศัพท์ระดับกลางถึงสูง เริ่มใช้ศัพท์เทคนิค',
    examples: 'ตัวอย่างที่ต้องใช้การคิดวิเคราะห์',
    exercises: 'แบบฝึกหัดที่ต้องใช้การคิดวิเคราะห์และสังเคราะห์'
  },
  'ม.4': {
    complexity: 'ระดับสูง เหมาะสำหรับนักเรียนอายุ 15-16 ปี เน้นการคิดเชิงนามธรรม',
    vocabulary: 'ใช้คำศัพท์ระดับสูง ศัพท์เทคนิคและวิชาการ',
    examples: 'ตัวอย่างเชิงนามธรรมและการประยุกต์ใช้ในระดับสูง',
    exercises: 'แบบฝึกหัดระดับสูง เน้นการคิดเชิงวิพากษ์'
  },
  'ม.5': {
    complexity: 'ระดับสูงมาก เหมาะสำหรับนักเรียนอายุ 16-17 ปี เตรียมความพร้อมสู่อุดมศึกษา',
    vocabulary: 'ใช้คำศัพท์ระดับสูง ศัพท์วิชาการและเทคนิคขั้นสูง',
    examples: 'ตัวอย่างระดับมหาวิทยาลัยเบื้องต้น',
    exercises: 'แบบฝึกหัดระดับสูง เตรียมสอบเข้ามหาวิทยาลัย'
  },
  'ม.6': {
    complexity: 'ระดับสูงสุด เหมาะสำหรับนักเรียนอายุ 17-18 ปี เน้นการเตรียมตัวสู่อุดมศึกษา',
    vocabulary: 'ใช้คำศัพท์ระดับมหาวิทยาลัย ศัพท์วิชาการขั้นสูง',
    examples: 'ตัวอย่างระดับมหาวิทยาลัย การประยุกต์ใช้ในโลกแห่งความเป็นจริง',
    exercises: 'แบบฝึกหัดระดับมหาวิทยาลัยเบื้องต้น'
  }
};

// Content amount specifications
export const contentAmountSpecs = {
  'น้อย': {
    pages: '10-15 หน้า',
    sections: '3-4 หัวข้อหลัก',
    depth: 'เนื้อหาเฉพาะจุดสำคัญ',
    detail: 'คำอธิบายกระชับและชัดเจน'
  },
  'ปานกลาง': {
    pages: '20-30 หน้า',
    sections: '5-6 หัวข้อหลัก',
    depth: 'เนื้อหาครอบคลุมหัวข้อสำคัญ',
    detail: 'คำอธิบายละเอียดพอสมควร'
  },
  'มาก': {
    pages: '35-40 หน้า',
    sections: '7-8 หัวข้อหลัก',
    depth: 'เนื้อหาครอบคลุมและลึกซึ้ง',
    detail: 'คำอธิบายละเอียดและตัวอย่างมากมาย'
  }
};

// Exercise amount specifications
export const exerciseAmountSpecs = {
  'น้อย': {
    count: '5-8 ข้อ',
    types: 'แบบฝึกหัดพื้นฐาน',
    difficulty: 'ระดับง่ายถึงปานกลาง'
  },
  'ปานกลาง': {
    count: '10-15 ข้อ',
    types: 'แบบฝึกหัดหลากหลายรูปแบบ',
    difficulty: 'ระดับปานกลางถึงยาก'
  },
  'มาก': {
    count: '20+ ข้อ',
    types: 'แบบฝึกหัดครบทุกรูปแบบ',
    difficulty: 'ระดับง่ายถึงยากมาก'
  }
};

// Main system prompt template
export const systemPromptTemplate: PromptTemplate = {
  system: `คุณเป็นผู้เชี่ยวชาญด้านการศึกษาและการสอนของบริษัท Login-Learning ที่มีประสบการณ์ในการสร้างเอกสารการเรียนการสอนคุณภาพสูง

หน้าที่ของคุณ:
1. สร้างชีทเรียนสำหรับการสอน 4 ชั่วโมง
2. ปรับเนื้อหาให้เหมาะสมกับระดับชั้น
3. รวมพื้นที่สำหรับการเขียนโน้ตและการฝึกปฏิบัติ
4. ใช้ภาษาไทยที่เหมาะสมและเข้าใจง่าย

คำแนะนำสำคัญ:
- ใช้โครงสร้าง: วัตถุประสงค์ → เนื้อหาหลัก → กิจกรรม → แบบฝึกหัด → สรุป
- เน้นการเรียนรู้แบบมีส่วนร่วม
- สร้างพื้นที่ว่างสำหรับการเขียนโน้ต
- ใช้ตัวอย่างจากชีวิตจริง
- รวมภาพประกอบและไดอะแกรมที่เหมาะสม`,
  user: `สร้างชีทเรียนเรื่อง "{topic}" สำหรับนักเรียน{gradeLevel}

ข้อมูลเพิ่มเติม:
- ระดับชั้น: {gradeLevel}
- ปริมาณเนื้อหา: {contentAmount} ({contentAmountDetail})
- ปริมาณแบบฝึกหัด: {exerciseAmount} ({exerciseAmountDetail})
- แนวทางการสอน: {gradeLevelGuidance}

กรุณาสร้างในรูปแบบ JSON ที่มีโครงสร้างดังนี้:
{
  "title": "ชื่อชีทเรียน",
  "objectives": ["วัตถุประสงค์ 1", "วัตถุประสงค์ 2", ...],
  "mainContent": [
    {
      "id": "section1",
      "title": "หัวข้อ",
      "content": "เนื้อหา",
      "type": "theory|example|explanation",
      "noteSpace": true
    }
  ],
  "exercises": [
    {
      "id": "ex1",
      "question": "คำถาม",
      "type": "multiple-choice|short-answer|essay",
      "answerSpace": จำนวนบรรทัด,
      "difficulty": "easy|medium|hard"
    }
  ],
  "activities": [
    {
      "id": "act1",
      "title": "ชื่อกิจกรรม",
      "description": "รายละเอียด",
      "duration": จำนวนนาที,
      "materials": ["วัสดุ 1", "วัสดุ 2"]
    }
  ],
  "summary": "สรุปบทเรียน",
  "images": [
    {
      "id": "img1",
      "description": "คำอธิบายภาพ",
      "keywords": ["คำค้นหา1", "คำค้นหา2"]
    }
  ]
}`,
  variables: ['topic', 'gradeLevel', 'contentAmount', 'exerciseAmount', 'contentAmountDetail', 'exerciseAmountDetail', 'gradeLevelGuidance']
};

// Helper function to generate prompts
export const generatePrompt = (
  topic: string,
  gradeLevel: GradeLevel,
  contentAmount: ContentAmount,
  exerciseAmount: ExerciseAmount
): { system: string; user: string } => {
  const gradeGuidance = gradeLevelPrompts[gradeLevel];
  const contentSpec = contentAmountSpecs[contentAmount];
  const exerciseSpec = exerciseAmountSpecs[exerciseAmount];

  const gradeLevelGuidance = `${gradeGuidance.complexity}. ${gradeGuidance.vocabulary}. ${gradeGuidance.examples}. ${gradeGuidance.exercises}`;
  const contentAmountDetail = `${contentSpec.pages}, ${contentSpec.sections}, ${contentSpec.depth}`;
  const exerciseAmountDetail = `${exerciseSpec.count}, ${exerciseSpec.types}, ${exerciseSpec.difficulty}`;

  const userPrompt = systemPromptTemplate.user
    .replace('{topic}', topic)
    .replace(/\{gradeLevel\}/g, gradeLevel)
    .replace('{contentAmount}', contentAmount)
    .replace('{exerciseAmount}', exerciseAmount)
    .replace('{contentAmountDetail}', contentAmountDetail)
    .replace('{exerciseAmountDetail}', exerciseAmountDetail)
    .replace('{gradeLevelGuidance}', gradeLevelGuidance);

  return {
    system: systemPromptTemplate.system,
    user: userPrompt
  };
};

// Validation prompts for content quality
export const validationPrompts = {
  appropriateness: `ตรวจสอบความเหมาะสมของเนื้อหาสำหรับนักเรียนระดับ {gradeLevel}:
1. ความยากง่ายของเนื้อหา
2. ความเหมาะสมของคำศัพท์
3. ความเหมาะสมของตัวอย่าง
4. ความปลอดภัยของเนื้อหา`,
  
  completeness: `ตรวจสอบความครบถ้วนของชีทเรียน:
1. มีวัตถุประสงค์ชัดเจน
2. เนื้อหาครอบคลุมหัวข้อ
3. มีแบบฝึกหัดเพียงพอ
4. มีกิจกรรมที่เหมาะสม
5. มีการสรุปบทเรียน`,
  
  quality: `ประเมินคุณภาพของเนื้อหา:
1. ความถูกต้องของข้อมูล
2. ความชัดเจนของการอธิบาย
3. ความน่าสนใจของเนื้อหา
4. ความเหมาะสมของการจัดรูปแบบ`
};