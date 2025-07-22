import { 
  DiagramGenerationRequest, 
  DiagramGenerationResponse, 
  GeneratedDiagram,
  AnimationData,
  GradeLevel,
  InteractiveElement 
} from '@/types';

export class DiagramGenerationService {
  private static readonly GRADE_COMPLEXITY_MAP = {
    'ม.1': { maxElements: 4, preferredTypes: ['process', 'concept-map'], complexity: 'simple' },
    'ม.2': { maxElements: 5, preferredTypes: ['process', 'concept-map'], complexity: 'simple' },
    'ม.3': { maxElements: 6, preferredTypes: ['diagram', 'chart', 'timeline'], complexity: 'moderate' },
    'ม.4': { maxElements: 7, preferredTypes: ['diagram', 'chart', 'timeline'], complexity: 'moderate' },
    'ม.5': { maxElements: 8, preferredTypes: ['diagram', 'chart', 'concept-map'], complexity: 'complex' },
    'ม.6': { maxElements: 9, preferredTypes: ['diagram', 'chart', 'concept-map'], complexity: 'complex' }
  };

  private static readonly DIAGRAM_TEMPLATES = {
    'process': {
      svgTemplate: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" class="w-full h-auto">
          <defs>
            <linearGradient id="processGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#1E40AF;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
            </linearGradient>
          </defs>
          {{CONTENT}}
        </svg>
      `,
      stepTemplate: `
        <g transform="translate({{X}}, {{Y}})">
          <rect width="140" height="60" rx="10" fill="url(#processGrad)" stroke="#1E40AF" stroke-width="2"/>
          <text x="70" y="35" text-anchor="middle" fill="white" font-family="Kanit" font-size="14">{{STEP_TEXT}}</text>
        </g>
      `,
      arrowTemplate: `
        <path d="M {{X1}} {{Y1}} L {{X2}} {{Y2}}" stroke="#1E40AF" stroke-width="3" marker-end="url(#arrowhead)"/>
      `
    },
    'concept-map': {
      svgTemplate: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" class="w-full h-auto">
          <defs>
            <linearGradient id="conceptGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#1E40AF;stop-opacity:1" />
            </linearGradient>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#1E40AF" />
            </marker>
          </defs>
          {{CONTENT}}
        </svg>
      `,
      nodeTemplate: `
        <g transform="translate({{X}}, {{Y}})">
          <ellipse cx="{{CX}}" cy="{{CY}}" rx="{{RX}}" ry="{{RY}}" fill="url(#conceptGrad)" stroke="#1E40AF" stroke-width="2"/>
          <text x="{{CX}}" y="{{CY}}" text-anchor="middle" fill="white" font-family="Sarabun" font-size="{{FONT_SIZE}}">{{NODE_TEXT}}</text>
        </g>
      `,
      connectionTemplate: `
        <path d="M {{X1}} {{Y1}} Q {{CX}} {{CY}} {{X2}} {{Y2}}" stroke="#1E40AF" stroke-width="2" fill="none" marker-end="url(#arrowhead)"/>
        <text x="{{LX}}" y="{{LY}}" text-anchor="middle" font-family="Sarabun" font-size="12" fill="#1E40AF">{{LABEL}}</text>
      `
    },
    'timeline': {
      svgTemplate: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 300" class="w-full h-auto">
          <defs>
            <linearGradient id="timelineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#1E40AF;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
            </linearGradient>
          </defs>
          <line x1="50" y1="150" x2="850" y2="150" stroke="url(#timelineGrad)" stroke-width="4"/>
          {{CONTENT}}
        </svg>
      `,
      eventTemplate: `
        <g transform="translate({{X}}, {{Y}})">
          <circle cx="0" cy="0" r="8" fill="#1E40AF" stroke="white" stroke-width="3"/>
          <rect x="-60" y="-40" width="120" height="30" rx="5" fill="white" stroke="#1E40AF" stroke-width="1"/>
          <text x="0" y="-25" text-anchor="middle" font-family="Sarabun" font-size="12" fill="#1E40AF">{{EVENT_TEXT}}</text>
          <text x="0" y="25" text-anchor="middle" font-family="Sarabun" font-size="10" fill="#666">{{DATE_TEXT}}</text>
        </g>
      `
    },
    'chart': {
      svgTemplate: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" class="w-full h-auto">
          <defs>
            <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:0.8" />
              <stop offset="100%" style="stop-color:#1E40AF;stop-opacity:0.8" />
            </linearGradient>
          </defs>
          {{CONTENT}}
        </svg>
      `,
      barTemplate: `
        <rect x="{{X}}" y="{{Y}}" width="{{WIDTH}}" height="{{HEIGHT}}" fill="url(#chartGrad)" stroke="#1E40AF" stroke-width="1"/>
        <text x="{{TX}}" y="{{TY}}" text-anchor="middle" font-family="Sarabun" font-size="12" fill="#333">{{LABEL}}</text>
      `
    }
  };

  public static async generateDiagram(
    request: DiagramGenerationRequest
  ): Promise<DiagramGenerationResponse> {
    try {
      const mainDiagram = await this.createDiagram(request);
      const alternatives = await this.generateAlternatives(request);

      return {
        diagram: mainDiagram,
        alternatives
      };
    } catch (error) {
      console.error('Error generating diagram:', error);
      return {
        diagram: this.getFallbackDiagram(request),
        alternatives: []
      };
    }
  }

  private static async createDiagram(request: DiagramGenerationRequest): Promise<GeneratedDiagram> {
    const { concept, gradeLevel, diagramType, complexity, context } = request;
    const gradeConfig = this.GRADE_COMPLEXITY_MAP[gradeLevel];

    switch (diagramType) {
      case 'process':
        return this.generateProcessDiagram(concept, gradeLevel, context);
      case 'concept-map':
        return this.generateConceptMap(concept, gradeLevel, context);
      case 'timeline':
        return this.generateTimeline(concept, gradeLevel, context);
      case 'chart':
        return this.generateChart(concept, gradeLevel, context);
      default:
        return this.generateGenericDiagram(concept, gradeLevel, context);
    }
  }

  private static generateProcessDiagram(
    concept: string, 
    gradeLevel: GradeLevel, 
    context: string
  ): GeneratedDiagram {
    const gradeConfig = this.GRADE_COMPLEXITY_MAP[gradeLevel];
    const steps = this.generateProcessSteps(concept, gradeConfig.maxElements);
    
    let svgContent = this.DIAGRAM_TEMPLATES.process.svgTemplate;
    let content = '';

    // Add arrow marker definition
    content += `
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#1E40AF" />
        </marker>
      </defs>
    `;

    // Generate steps
    steps.forEach((step, index) => {
      const x = 50 + (index * 180);
      const y = 170;
      
      content += this.DIAGRAM_TEMPLATES.process.stepTemplate
        .replace('{{X}}', x.toString())
        .replace('{{Y}}', y.toString())
        .replace('{{STEP_TEXT}}', step);

      // Add arrow to next step
      if (index < steps.length - 1) {
        content += this.DIAGRAM_TEMPLATES.process.arrowTemplate
          .replace('{{X1}}', (x + 140).toString())
          .replace('{{Y1}}', (y + 30).toString())
          .replace('{{X2}}', (x + 180).toString())
          .replace('{{Y2}}', (y + 30).toString());
      }
    });

    svgContent = svgContent.replace('{{CONTENT}}', content);

    return {
      id: `process-${concept}-${Date.now()}`,
      title: `ขั้นตอนการ${concept}`,
      type: 'process',
      svgContent,
      description: `แผนภาพแสดงขั้นตอนการ${concept} เหมาะสำหรับนักเรียน${gradeLevel}`,
      instructions: [
        'อ่านขั้นตอนจากซ้ายไปขวา',
        'ทำความเข้าใจแต่ละขั้นตอนก่อนไปขั้นตอนถัดไป',
        'สังเกตลูกศรที่แสดงทิศทางการดำเนินงาน'
      ],
      interactiveElements: this.generateInteractiveElements('process', steps.length)
    };
  }

  private static generateConceptMap(
    concept: string, 
    gradeLevel: GradeLevel, 
    context: string
  ): GeneratedDiagram {
    const gradeConfig = this.GRADE_COMPLEXITY_MAP[gradeLevel];
    const concepts = this.generateRelatedConcepts(concept, gradeConfig.maxElements);
    
    let svgContent = this.DIAGRAM_TEMPLATES['concept-map'].svgTemplate;
    let content = '';

    // Central concept
    const centerX = 400;
    const centerY = 300;
    content += this.DIAGRAM_TEMPLATES['concept-map'].nodeTemplate
      .replace('{{X}}', '0')
      .replace('{{Y}}', '0')
      .replace('{{CX}}', centerX.toString())
      .replace('{{CY}}', centerY.toString())
      .replace('{{RX}}', '80')
      .replace('{{RY}}', '40')
      .replace('{{FONT_SIZE}}', '16')
      .replace('{{NODE_TEXT}}', concept);

    // Related concepts in circle around center
    concepts.forEach((relatedConcept, index) => {
      const angle = (2 * Math.PI * index) / concepts.length;
      const radius = 200;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      content += this.DIAGRAM_TEMPLATES['concept-map'].nodeTemplate
        .replace('{{X}}', '0')
        .replace('{{Y}}', '0')
        .replace('{{CX}}', x.toString())
        .replace('{{CY}}', y.toString())
        .replace('{{RX}}', '60')
        .replace('{{RY}}', '30')
        .replace('{{FONT_SIZE}}', '14')
        .replace('{{NODE_TEXT}}', relatedConcept);

      // Connection to center
      const midX = (centerX + x) / 2;
      const midY = (centerY + y) / 2;
      content += this.DIAGRAM_TEMPLATES['concept-map'].connectionTemplate
        .replace('{{X1}}', centerX.toString())
        .replace('{{Y1}}', centerY.toString())
        .replace('{{CX}}', midX.toString())
        .replace('{{CY}}', midY.toString())
        .replace('{{X2}}', x.toString())
        .replace('{{Y2}}', y.toString())
        .replace('{{LX}}', midX.toString())
        .replace('{{LY}}', (midY - 10).toString())
        .replace('{{LABEL}}', 'เกี่ยวข้อง');
    });

    svgContent = svgContent.replace('{{CONTENT}}', content);

    return {
      id: `concept-map-${concept}-${Date.now()}`,
      title: `แผนผังแนวคิดเรื่อง${concept}`,
      type: 'concept-map',
      svgContent,
      description: `แผนผังแสดงความสัมพันธ์ของแนวคิดเรื่อง${concept}`,
      instructions: [
        'เริ่มที่แนวคิดหลักตรงกลาง',
        'ดูความเชื่อมโยงกับแนวคิดย่อยรอบๆ',
        'ทำความเข้าใจความสัมพันธ์ระหว่างแนวคิดต่างๆ'
      ],
      interactiveElements: this.generateInteractiveElements('concept-map', concepts.length + 1)
    };
  }

  private static generateTimeline(
    concept: string, 
    gradeLevel: GradeLevel, 
    context: string
  ): GeneratedDiagram {
    const gradeConfig = this.GRADE_COMPLEXITY_MAP[gradeLevel];
    const events = this.generateTimelineEvents(concept, gradeConfig.maxElements);
    
    let svgContent = this.DIAGRAM_TEMPLATES.timeline.svgTemplate;
    let content = '';

    events.forEach((event, index) => {
      const x = 50 + (index * (800 / (events.length - 1)));
      const y = 150;

      content += this.DIAGRAM_TEMPLATES.timeline.eventTemplate
        .replace('{{X}}', x.toString())
        .replace('{{Y}}', y.toString())
        .replace('{{EVENT_TEXT}}', event.title)
        .replace('{{DATE_TEXT}}', event.date || `ขั้นที่ ${index + 1}`);
    });

    svgContent = svgContent.replace('{{CONTENT}}', content);

    return {
      id: `timeline-${concept}-${Date.now()}`,
      title: `เส้นเวลาการพัฒนา${concept}`,
      type: 'timeline',
      svgContent,
      description: `เส้นเวลาแสดงการพัฒนาของ${concept}`,
      instructions: [
        'อ่านเหตุการณ์จากซ้ายไปขวาตามลำดับเวลา',
        'สังเกตการเปลี่ยนแปลงในแต่ละช่วงเวลา',
        'เชื่อมโยงเหตุการณ์ต่างๆ เข้าด้วยกัน'
      ],
      interactiveElements: this.generateInteractiveElements('timeline', events.length)
    };
  }

  private static generateChart(
    concept: string, 
    gradeLevel: GradeLevel, 
    context: string
  ): GeneratedDiagram {
    const gradeConfig = this.GRADE_COMPLEXITY_MAP[gradeLevel];
    const data = this.generateChartData(concept, gradeConfig.maxElements);
    
    let svgContent = this.DIAGRAM_TEMPLATES.chart.svgTemplate;
    let content = '';

    // Add axes
    content += '<line x1="80" y1="50" x2="80" y2="350" stroke="#333" stroke-width="2"/>'; // Y-axis
    content += '<line x1="80" y1="350" x2="550" y2="350" stroke="#333" stroke-width="2"/>'; // X-axis

    // Add bars
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = 400 / data.length;

    data.forEach((item, index) => {
      const height = (item.value / maxValue) * 250;
      const x = 100 + (index * barWidth);
      const y = 350 - height;

      content += this.DIAGRAM_TEMPLATES.chart.barTemplate
        .replace('{{X}}', x.toString())
        .replace('{{Y}}', y.toString())
        .replace('{{WIDTH}}', (barWidth - 20).toString())
        .replace('{{HEIGHT}}', height.toString())
        .replace('{{TX}}', (x + (barWidth - 20) / 2).toString())
        .replace('{{TY}}', '370')
        .replace('{{LABEL}}', item.label);

      // Add value label on top of bar
      content += `<text x="${x + (barWidth - 20) / 2}" y="${y - 5}" text-anchor="middle" font-family="Sarabun" font-size="12" fill="#333">${item.value}</text>`;
    });

    // Add chart title
    content += `<text x="300" y="30" text-anchor="middle" font-family="Kanit" font-size="16" fill="#1E40AF">แผนภูมิแสดง${concept}</text>`;

    svgContent = svgContent.replace('{{CONTENT}}', content);

    return {
      id: `chart-${concept}-${Date.now()}`,
      title: `แผนภูมิแสดง${concept}`,
      type: 'chart',
      svgContent,
      description: `แผนภูมิแสดงข้อมูลเกี่ยวกับ${concept}`,
      instructions: [
        'อ่านชื่อแผนภูมิและแกนทั้งสอง',
        'เปรียบเทียบความสูงของแท่งกราฟ',
        'วิเคราะห์ข้อมูลและหาข้อสรุป'
      ],
      interactiveElements: this.generateInteractiveElements('chart', data.length)
    };
  }

  private static generateGenericDiagram(
    concept: string, 
    gradeLevel: GradeLevel, 
    context: string
  ): GeneratedDiagram {
    // Fallback to concept map
    return this.generateConceptMap(concept, gradeLevel, context);
  }

  private static generateProcessSteps(concept: string, maxSteps: number): string[] {
    const commonSteps = {
      'การเรียน': ['เตรียมตัว', 'ศึกษา', 'ฝึกฝน', 'ทบทวน'],
      'การทำงาน': ['วางแผน', 'ลงมือทำ', 'ตรวจสอบ', 'ปรับปรุง'],
      'การแก้ปัญหา': ['วิเคราะห์', 'หาทางออก', 'ทดลอง', 'ประเมินผล'],
      'การทดลอง': ['สมมติฐาน', 'เตรียมอุปกรณ์', 'ทดลอง', 'บันทึกผล']
    };

    for (const [key, steps] of Object.entries(commonSteps)) {
      if (concept.includes(key.replace('การ', ''))) {
        return steps.slice(0, Math.min(maxSteps, steps.length));
      }
    }

    // Generate generic steps
    const genericSteps = ['เริ่มต้น', 'ดำเนินการ', 'ตรวจสอบ', 'สรุป'];
    return genericSteps.slice(0, Math.min(maxSteps, genericSteps.length));
  }

  private static generateRelatedConcepts(concept: string, maxConcepts: number): string[] {
    const conceptMap = {
      'คณิตศาสตร์': ['ตัวเลข', 'สมการ', 'รูปทรง', 'กราฟ'],
      'วิทยาศาสตร์': ['การทดลอง', 'สมมติฐาน', 'การสังเกต', 'ข้อสรุป'],
      'ภาษา': ['คำศัพท์', 'ไวยากรณ์', 'การอ่าน', 'การเขียน'],
      'สังคม': ['ชุมชน', 'วัฒนธรรม', 'ประเพณี', 'การปกครอง']
    };

    for (const [key, concepts] of Object.entries(conceptMap)) {
      if (concept.includes(key)) {
        return concepts.slice(0, Math.min(maxConcepts, concepts.length));
      }
    }

    // Generate generic related concepts
    return ['แนวคิดที่ 1', 'แนวคิดที่ 2', 'แนวคิดที่ 3'].slice(0, maxConcepts);
  }

  private static generateTimelineEvents(concept: string, maxEvents: number): Array<{title: string, date?: string}> {
    const timelineTemplates = {
      'ประวัติศาสตร์': [
        { title: 'จุดเริ่มต้น', date: 'อดีต' },
        { title: 'การพัฒนา', date: 'กลาง' },
        { title: 'ยุคทอง', date: 'ใหม่' },
        { title: 'ปัจจุบัน', date: 'ตอนนี้' }
      ],
      'วิวัฒนาการ': [
        { title: 'รูปแบบแรก' },
        { title: 'การปรับปรุง' },
        { title: 'การพัฒนา' },
        { title: 'รูปแบบปัจจุบัน' }
      ]
    };

    for (const [key, events] of Object.entries(timelineTemplates)) {
      if (concept.includes(key)) {
        return events.slice(0, Math.min(maxEvents, events.length));
      }
    }

    // Generate generic timeline
    return Array.from({ length: Math.min(maxEvents, 4) }, (_, i) => ({
      title: `เหตุการณ์ที่ ${i + 1}`,
      date: `ช่วงที่ ${i + 1}`
    }));
  }

  private static generateChartData(concept: string, maxItems: number): Array<{label: string, value: number}> {
    const chartTemplates = {
      'สถิติ': [
        { label: 'กลุ่ม A', value: 75 },
        { label: 'กลุ่ม B', value: 60 },
        { label: 'กลุ่ม C', value: 85 },
        { label: 'กลุ่ม D', value: 70 }
      ],
      'เปรียบเทียบ': [
        { label: 'วิธีที่ 1', value: 80 },
        { label: 'วิธีที่ 2', value: 65 },
        { label: 'วิธีที่ 3', value: 90 }
      ]
    };

    for (const [key, data] of Object.entries(chartTemplates)) {
      if (concept.includes(key)) {
        return data.slice(0, Math.min(maxItems, data.length));
      }
    }

    // Generate generic chart data
    return Array.from({ length: Math.min(maxItems, 4) }, (_, i) => ({
      label: `รายการ ${i + 1}`,
      value: Math.floor(Math.random() * 50) + 50
    }));
  }

  private static generateInteractiveElements(diagramType: string, elementCount: number): InteractiveElement[] {
    const elements: InteractiveElement[] = [];

    switch (diagramType) {
      case 'process':
        for (let i = 0; i < elementCount; i++) {
          elements.push({
            id: `step-${i}`,
            type: 'clickable',
            trigger: 'click',
            action: 'highlight',
            description: `คลิกเพื่อดูรายละเอียดขั้นตอนที่ ${i + 1}`
          });
        }
        break;

      case 'concept-map':
        elements.push({
          id: 'central-concept',
          type: 'hoverable',
          trigger: 'hover',
          action: 'expand',
          description: 'วางเมาส์เพื่อดูรายละเอียดแนวคิดหลัก'
        });
        break;

      case 'timeline':
        for (let i = 0; i < elementCount; i++) {
          elements.push({
            id: `event-${i}`,
            type: 'clickable',
            trigger: 'click',
            action: 'show-details',
            description: `คลิกเพื่อดูรายละเอียดเหตุการณ์ที่ ${i + 1}`
          });
        }
        break;

      case 'chart':
        for (let i = 0; i < elementCount; i++) {
          elements.push({
            id: `bar-${i}`,
            type: 'hoverable',
            trigger: 'hover',
            action: 'show-value',
            description: `วางเมาส์เพื่อดูค่าของรายการที่ ${i + 1}`
          });
        }
        break;
    }

    return elements;
  }

  private static async generateAlternatives(request: DiagramGenerationRequest): Promise<GeneratedDiagram[]> {
    const alternatives: GeneratedDiagram[] = [];
    const gradeConfig = this.GRADE_COMPLEXITY_MAP[request.gradeLevel];

    // Generate alternative diagram types
    for (const altType of gradeConfig.preferredTypes) {
      if (altType !== request.diagramType) {
        const altRequest = { ...request, diagramType: altType as any };
        try {
          const altDiagram = await this.createDiagram(altRequest);
          alternatives.push(altDiagram);
        } catch (error) {
          console.error(`Error generating alternative diagram type ${altType}:`, error);
        }
      }
    }

    return alternatives.slice(0, 2); // Limit to 2 alternatives
  }

  private static getFallbackDiagram(request: DiagramGenerationRequest): GeneratedDiagram {
    return {
      id: `fallback-${request.concept}-${Date.now()}`,
      title: `แผนภาพเรื่อง${request.concept}`,
      type: 'diagram',
      svgContent: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" class="w-full h-auto">
          <rect width="400" height="200" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2" rx="10"/>
          <text x="200" y="100" text-anchor="middle" font-family="Kanit" font-size="16" fill="#64748b">
            แผนภาพเรื่อง${request.concept}
          </text>
          <text x="200" y="130" text-anchor="middle" font-family="Sarabun" font-size="12" fill="#94a3b8">
            (กำลังสร้างเนื้อหา)
          </text>
        </svg>
      `,
      description: `แผนภาพพื้นฐานสำหรับเรื่อง${request.concept}`,
      instructions: [
        'ศึกษาเนื้อหาประกอบ',
        'ทำความเข้าใจแนวคิดหลัก',
        'เชื่อมโยงกับความรู้เดิม'
      ]
    };
  }
}

export default DiagramGenerationService;