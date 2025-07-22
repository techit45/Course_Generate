# Design Document - Study Sheet Generator

## Overview

เว็บแอปพลิเคชัน Study Sheet Generator เป็นระบบที่ช่วยให้ผู้ใช้สร้างชีทเรียนสำหรับการสอนหรือเรียนรู้ในระยะเวลา 4 ชั่วโมง โดยใช้ AI ของ Open Router ในการสร้างเนื้อหา และสามารถส่งออกเป็นทั้ง PDF และหน้าเว็บที่สวยงาม

### Key Features

- ฟอร์มสร้างชีทเรียนที่สวยงามพร้อม realtime preview
- การเลือกระดับชั้น มัธยม 1-6
- การปรับแต่งปริมาณเนื้อหาและแบบฝึกหัด
- ระบบแก้ไขชีทเรียนหลังสร้าง
- ธีมสีน้ำเงินตามแบรนด์ Login-Learning
- รูปภาพและ Animation ประกอบ
- ส่งออกเป็น PDF (30-40 หน้า) และหน้าเว็บ

## Architecture

### System Architecture

```
Frontend (React/Next.js)
├── Form Component (Input & Preview)
├── Sheet Generator Component
├── PDF Generator Component
├── Web Export Component
└── Edit Component

Backend (Node.js/Express)
├── AI Service (Open Router Integration)
├── Content Generator Service
├── PDF Generation Service
├── Image/Animation Service
└── Template Service
```

### Technology Stack

- **Frontend**: React/Next.js, Tailwind CSS, React Hook Form
- **Backend**: Node.js, Express.js
- **AI Integration**: Open Router API (Free tier)
- **PDF Generation**: Puppeteer หรือ jsPDF
- **Styling**: Tailwind CSS พร้อมธีมสีน้ำเงิน
- **State Management**: React Context หรือ Zustand
- **Image Handling**: Unsplash API หรือ local assets

## Components and Interfaces

### 1. Main Form Component

```typescript
interface StudySheetForm {
  topic: string;
  gradeLevel: "ม.1" | "ม.2" | "ม.3" | "ม.4" | "ม.5" | "ม.6";
  contentAmount: "น้อย" | "ปานกลาง" | "มาก";
  exerciseAmount: "น้อย" | "ปานกลาง" | "มาก";
}
```

**Features:**

- Realtime preview ขณะกรอกข้อมูล
- Responsive design
- ธีมสีน้ำเงิน Login-Learning
- Validation และ error handling

### 2. AI Content Generator Service

```typescript
interface AIService {
  generateContent(params: {
    topic: string;
    gradeLevel: string;
    contentAmount: string;
    exerciseAmount: string;
  }): Promise<StudySheetContent>;
}

interface StudySheetContent {
  title: string;
  objectives: string[];
  mainContent: ContentSection[];
  exercises: Exercise[];
  activities: Activity[];
  summary: string;
  images: ImageSuggestion[];
}
```

### 3. PDF Generator Component

```typescript
interface PDFGenerator {
  generatePDF(content: StudySheetContent): Promise<Blob>;
  pageCount: 30-40; // หน้า
  layout: 'A4';
  theme: 'Login-Learning-Blue';
}
```

### 4. Web Export Component

```typescript
interface WebExport {
  generateWebPage(content: StudySheetContent): Promise<string>;
  includeAnimations: boolean;
  responsiveDesign: boolean;
  theme: "Login-Learning-Blue";
}
```

### 5. Edit Component

```typescript
interface EditInterface {
  editContent(content: StudySheetContent): StudySheetContent;
  addSection(section: ContentSection): void;
  removeSection(sectionId: string): void;
  modifyExercise(exerciseId: string, newExercise: Exercise): void;
}
```

## Data Models

### StudySheet Model

```typescript
interface StudySheet {
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

interface ContentSection {
  id: string;
  title: string;
  content: string;
  type: "theory" | "example" | "explanation";
  images?: ImageData[];
  animations?: AnimationData[];
  noteSpace: boolean; // พื้นที่สำหรับเขียนโน้ต
}

interface Exercise {
  id: string;
  question: string;
  type: "multiple-choice" | "short-answer" | "essay";
  answerSpace: number; // จำนวนบรรทัดสำหรับตอบ
  difficulty: "easy" | "medium" | "hard";
}

interface Activity {
  id: string;
  title: string;
  description: string;
  duration: number; // นาที
  materials: string[];
}
```

### Theme Configuration

```typescript
interface LoginLearningTheme {
  primary: "#1E40AF"; // น้ำเงินหลัก
  secondary: "#3B82F6"; // น้ำเงินอ่อน
  accent: "#60A5FA"; // น้ำเงินสว่าง
  background: "#F8FAFC";
  text: "#1F2937";
  logo: string; // โลโก้ Login-Learning
  fonts: {
    heading: "Kanit";
    body: "Sarabun";
  };
}
```

## Error Handling

### AI Service Error Handling

```typescript
class AIServiceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

// Error scenarios:
// - API rate limit exceeded
// - Invalid API key
// - Network timeout
// - Invalid response format
```

### PDF Generation Error Handling

```typescript
class PDFGenerationError extends Error {
  constructor(message: string, public details: any) {
    super(message);
  }
}

// Error scenarios:
// - Content too large
// - Image loading failed
// - Template rendering error
```

### User Input Validation

```typescript
const formValidation = {
  topic: {
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  gradeLevel: {
    required: true,
    enum: ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"],
  },
};
```

## Testing Strategy

### Unit Testing

- AI Service integration tests
- PDF generation tests
- Form validation tests
- Content formatting tests

### Integration Testing

- End-to-end form submission
- PDF download functionality
- Web export functionality
- Edit functionality

### User Acceptance Testing

- Form usability testing
- PDF quality verification
- Realtime preview accuracy
- Mobile responsiveness

### Performance Testing

- AI API response time (< 3 seconds)
- PDF generation time
- Large content handling
- Concurrent user testing

## Implementation Phases

### Phase 1: Core Infrastructure

- Basic form setup
- AI integration with Open Router
- Basic content generation

### Phase 2: Content Enhancement

- Image and animation integration
- Theme implementation
- Realtime preview

### Phase 3: Export Features

- PDF generation (30-40 pages)
- Web export functionality
- Download mechanisms

### Phase 4: Advanced Features

- Edit functionality
- Content customization
- Error handling improvements

### Phase 5: Polish & Optimization

- Performance optimization
- UI/UX improvements
- Testing and bug fixes
