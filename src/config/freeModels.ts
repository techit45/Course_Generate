import { OpenRouterConfig } from '@/types';

// Interface สำหรับข้อมูลโมเดล
export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  provider: string;
  contextWindow: number;
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  educationScore: number; // 1-10 scale for educational content generation
  thaiLanguageSupport: 'excellent' | 'good' | 'fair' | 'limited';
  speed: 'fast' | 'medium' | 'slow';
  config: Partial<OpenRouterConfig>;
}

// โมเดลฟรีที่แนะนำสำหรับการสร้างชีทเรียน (เรียงตามความเหมาะสม)
export const recommendedFreeModels: ModelInfo[] = [
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2 3B Instruct',
    description: 'โมเดลขนาด 3B จาก Meta ที่ปรับแต่งสำหรับการตอบคำถาม เหมาะสำหรับเนื้อหาการศึกษา',
    provider: 'Meta',
    contextWindow: 128000,
    strengths: [
      'เข้าใจคำสั่งได้ดี',
      'สร้างเนื้อหาที่มีโครงสร้าง',
      'รองรับภาษาไทยได้พอใช้',
      'รวดเร็วในการตอบสนอง',
      'เหมาะสำหรับการสร้างแบบฝึกหัด'
    ],
    weaknesses: [
      'ความรู้ภาษาไทยจำกัด',
      'บางครั้งอาจไม่เข้าใจบริบททางการศึกษาไทย',
      'คำตอบอาจสั้นเกินไป'
    ],
    bestFor: [
      'สร้างแบบฝึกหัดพื้นฐาน',
      'วัตถุประสงค์การเรียนรู้',
      'โครงสร้างเนื้อหา',
      'การสร้างกิจกรรมง่าย ๆ'
    ],
    educationScore: 8,
    thaiLanguageSupport: 'fair',
    speed: 'fast',
    config: {
      maxTokens: 4000,
      temperature: 0.7,
      timeout: 25000
    }
  },
  
  {
    id: 'microsoft/phi-3-mini-128k-instruct:free',
    name: 'Phi-3 Mini 128K Instruct',
    description: 'โมเดลจาก Microsoft ที่มี context window ขนาดใหญ่ เหมาะสำหรับเนื้อหายาว ๆ',
    provider: 'Microsoft',
    contextWindow: 128000,
    strengths: [
      'Context window ขนาดใหญ่ (128K tokens)',
      'เข้าใจโครงสร้างเนื้อหาได้ดี',
      'สร้างเนื้อหาที่สอดคล้องกัน',
      'เหมาะสำหรับชีทเรียนยาว ๆ',
      'คุณภาพคำตอบดี'
    ],
    weaknesses: [
      'ช้ากว่าโมเดลอื่น ๆ',
      'ภาษาไทยไม่แข็งแรงมาก',
      'บางครั้งให้รายละเอียดมากเกินไป'
    ],
    bestFor: [
      'เนื้อหายาวและซับซอน',
      'การสร้างชีทเรียนแบบครบถ้วน',
      'การเชื่อมโยงเนื้อหาหลายส่วน',
      'สรุปและการทบทวน'
    ],
    educationScore: 8.5,
    thaiLanguageSupport: 'good',
    speed: 'medium',
    config: {
      maxTokens: 6000,
      temperature: 0.6,
      timeout: 35000
    }
  },

  {
    id: 'huggingface/zephyr-7b-beta:free',
    name: 'Zephyr 7B Beta',
    description: 'โมเดลโอเพนซอร์สที่ปรับแต่งมาให้เป็นมิตรกับผู้ใช้ มีความสามารถในการสร้างเนื้อหาที่หลากหลาย',
    provider: 'Hugging Face',
    contextWindow: 32000,
    strengths: [
      'สร้างเนื้อหาที่หลากหลายและน่าสนใจ',
      'เข้าใจบริบทการศึกษาได้ดี',
      'สร้างกิจกรรมสร้างสรรค์ได้',
      'ตอบสนองต่อคำสั่งที่ซับซ้อน',
      'เหมาะสำหรับสร้างเนื้อหาที่น่าสนใจ'
    ],
    weaknesses: [
      'บางครั้งให้ข้อมูลที่ไม่แม่นยำ',
      'ภาษาไทยยังไม่เก่งมาก',
      'อาจสร้างเนื้อหาที่ซับซ้อนเกินไปสำหรับนักเรียนบางระดับ'
    ],
    bestFor: [
      'กิจกรรมการเรียนรู้ที่สร้างสรรค์',
      'การอธิบายแนวคิดยาก ๆ',
      'ตัวอย่างในชีวิตจริง',
      'เนื้อหาที่ต้องการความคิดสร้างสรรค์'
    ],
    educationScore: 7.5,
    thaiLanguageSupport: 'fair',
    speed: 'medium',
    config: {
      maxTokens: 5000,
      temperature: 0.8,
      timeout: 30000
    }
  },

  {
    id: 'openchat/openchat-7b:free',
    name: 'OpenChat 7B',
    description: 'โมเดลที่เน้นการสนทนาและการตอบสนองที่เป็นธรรมชาติ เหมาะสำหรับเนื้อหาที่ต้องอธิบาย',
    provider: 'OpenChat',
    contextWindow: 8192,
    strengths: [
      'ตอบคำถามได้อย่างชัดเจน',
      'อธิบายแนวคิดซับซ้อนได้เข้าใจง่าย',
      'เหมาะสำหรับการสร้างคำอธิบาย',
      'ให้ตัวอย่างที่เข้าใจง่าย',
      'รูปแบบการตอบที่เป็นมิตร'
    ],
    weaknesses: [
      'Context window เล็ก (8K)',
      'ไม่เหมาะสำหรับเนื้อหายาว',
      'ภาษาไทยจำกัด',
      'บางครั้งตอบไม่ตรงประเด็น'
    ],
    bestFor: [
      'การอธิบายแนวคิดพื้นฐาน',
      'คำตอบสำหรับแบบฝึกหัด',
      'การให้คำแนะนำสั้น ๆ',
      'เนื้อหาที่ต้องการความชัดเจน'
    ],
    educationScore: 7,
    thaiLanguageSupport: 'fair',
    speed: 'fast',
    config: {
      maxTokens: 3000,
      temperature: 0.7,
      timeout: 20000
    }
  }
];

// โมเดลเสริมที่น่าสนใจ (แต่อาจไม่เหมาะกับการศึกษามากนัก)
export const alternativeModels: ModelInfo[] = [
  {
    id: 'gryphe/mythomist-7b:free',
    name: 'Mythomist 7B',
    description: 'โมเดลที่เน้นการเล่าเรื่องและความคิดสร้างสรรค์',
    provider: 'Gryphe',
    contextWindow: 32000,
    strengths: ['สร้างสรรค์', 'เล่าเรื่องเก่ง', 'จินตนาการดี'],
    weaknesses: ['ไม่เหมาะสำหรับเนื้อหาวิชาการ', 'อาจไม่ตรงประเด็น'],
    bestFor: ['เรื่องเล่าในชีทเรียน', 'การสร้างบทสนทนา'],
    educationScore: 5,
    thaiLanguageSupport: 'limited',
    speed: 'medium',
    config: {
      maxTokens: 4000,
      temperature: 0.9,
      timeout: 25000
    }
  },
  
  {
    id: 'undi95/toppy-m-7b:free',
    name: 'Toppy-M 7B',
    description: 'โมเดลที่มีความสามารถหลากหลาย',
    provider: 'Undi95',
    contextWindow: 4096,
    strengths: ['หลากหลาย', 'ตอบสนองดี'],
    weaknesses: ['Context window เล็ก', 'คุณภาพไม่สม่ำเสมอ'],
    bestFor: ['งานทั่วไป', 'ทดสอบเนื้อหา'],
    educationScore: 6,
    thaiLanguageSupport: 'limited',
    speed: 'fast',
    config: {
      maxTokens: 3000,
      temperature: 0.7,
      timeout: 20000
    }
  }
];

// ฟังก์ชันเลือกโมเดลที่เหมาะสมตามเกรดและประเภทเนื้อหา
export function getRecommendedModelForContent(
  gradeLevel: string,
  contentAmount: string,
  contentType: 'basic' | 'advanced' | 'creative' = 'basic'
): ModelInfo {
  
  // สำหรับเนื้อหาพื้นฐานและปริมาณน้อย
  if (contentAmount === 'น้อย' || contentType === 'basic') {
    return recommendedFreeModels[0]; // Llama 3.2 3B - เร็วและเหมาะสำหรับพื้นฐาน
  }
  
  // สำหรับเนื้อหาปานกลางถึงมาก
  if (contentAmount === 'มาก') {
    return recommendedFreeModels[1]; // Phi-3 Mini - Context window ใหญ่
  }
  
  // สำหรับเนื้อหาที่ต้องการความคิดสร้างสรรค์
  if (contentType === 'creative') {
    return recommendedFreeModels[2]; // Zephyr - สร้างสรรค์
  }
  
  // สำหรับเนื้อหาที่ต้องการคำอธิบายชัดเจน
  if (contentType === 'advanced') {
    return recommendedFreeModels[3]; // OpenChat - อธิบายได้ดี
  }
  
  // Default fallback
  return recommendedFreeModels[0];
}

// สรุปคะแนนเฉลี่ยของโมเดลทั้งหมด
export const modelSummary = {
  totalModels: recommendedFreeModels.length,
  averageEducationScore: recommendedFreeModels.reduce((sum, model) => sum + model.educationScore, 0) / recommendedFreeModels.length,
  bestOverall: recommendedFreeModels[1], // Phi-3 Mini
  fastestModel: recommendedFreeModels[0], // Llama 3.2 3B
  bestForThai: recommendedFreeModels[1], // Phi-3 Mini
  mostCreative: recommendedFreeModels[2] // Zephyr
};