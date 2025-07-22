import { ExportService, ExportOptions } from '@/services/exportService'
import { StudySheetContent } from '@/types'
import jsPDF from 'jspdf'

// Mock dependencies
jest.mock('jspdf')
jest.mock('html2canvas')

const mockJsPDF = jsPDF as jest.MockedClass<typeof jsPDF>

describe('PDF Generation with Various Content Types', () => {
  let exportService: ExportService
  let mockPdfInstance: any
  let mockProgressCallback: jest.Mock

  beforeEach(() => {
    exportService = ExportService.getInstance()
    mockProgressCallback = jest.fn()
    exportService.setProgressCallback(mockProgressCallback)

    // Mock jsPDF instance
    mockPdfInstance = {
      addImage: jest.fn(),
      addPage: jest.fn(),
      setProperties: jest.fn(),
      output: jest.fn(() => new Blob(['mock-pdf'], { type: 'application/pdf' })),
      internal: {
        pageSize: {
          getWidth: () => 210,
          getHeight: () => 297
        }
      },
      setFillColor: jest.fn(),
      setTextColor: jest.fn(),
      setFont: jest.fn(),
      setFontSize: jest.fn(),
      text: jest.fn(),
      rect: jest.fn(),
      saveGraphicsState: jest.fn(),
      restoreGraphicsState: jest.fn(),
      setGState: jest.fn(),
      getTextWidth: jest.fn(() => 50),
      getNumberOfPages: jest.fn(() => 1),
      setPage: jest.fn(),
      GState: jest.fn()
    }
    
    mockJsPDF.mockImplementation(() => mockPdfInstance)

    // Mock html2canvas
    global.html2canvas = jest.fn(() => Promise.resolve({
      toDataURL: jest.fn(() => 'data:image/png;base64,test'),
      width: 800,
      height: 600
    }))

    // Reset mocks
    jest.clearAllMocks()
  })

  describe('Simple Content PDF Generation', () => {
    const simpleContent: StudySheetContent = {
      title: 'การบวกลบ',
      objectives: ['เข้าใจการบวกลบ', 'สามารถคำนวณได้'],
      mainContent: [
        {
          id: '1',
          title: 'การบวก',
          type: 'theory',
          content: '1 + 1 = 2',
          duration: 15
        }
      ],
      activities: [],
      exercises: [{
        id: '1',
        type: 'short-answer',
        question: '2 + 3 = ?',
        difficulty: 'easy',
        points: 1,
        answerSpace: 1
      }],
      images: [],
      summary: 'การบวกลบเป็นพื้นฐานของคณิตศาสตร์',
      metadata: {
        pageCount: 2,
        totalDuration: 60,
        difficultyLevel: 'ม.1',
        sectionCount: 1,
        exerciseCount: 1,
        activityCount: 0
      }
    }

    it('should generate PDF for simple content', async () => {
      const element = document.createElement('div')
      const result = await exportService.exportToPDF(simpleContent, element)

      expect(result.success).toBe(true)
      expect(result.downloadUrl).toBeDefined()
      expect(result.fileName).toContain('การบวกลบ')
      expect(mockPdfInstance.setProperties).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'การบวกลบ',
          author: 'Login-Learning AI System'
        })
      )
    })
  })

  describe('Complex Content PDF Generation', () => {
    const complexContent: StudySheetContent = {
      title: 'ฟิสิกส์ขั้นสูง - กลศาสตร์',
      objectives: [
        'เข้าใจหลักการของกฏของนิวตัน',
        'สามารถคำนวณแรงและความเร่งได้',
        'ประยุกต์ใช้ในปัญหาจริง',
        'วิเคราะห์การเคลื่อนที่ของวัตถุ'
      ],
      mainContent: [
        {
          id: '1',
          title: 'กฎข้อที่ 1 ของนิวตัน',
          type: 'theory',
          content: 'วัตถุจะคงสภาพการเคลื่อนที่หรือการหยุดนิ่ง จนกว่าจะมีแรงภายนอกมากระทำ',
          duration: 45,
          keyTerms: ['กฎของนิวตัน', 'ความเฉื่อย', 'แรง'],
          noteSpace: true
        },
        {
          id: '2',
          title: 'กฎข้อที่ 2 ของนิวตัน',
          type: 'explanation',
          content: 'F = ma โดย F คือแรง m คือมวล a คือความเร่ง',
          duration: 60,
          keyTerms: ['แรง', 'มวล', 'ความเร่ง'],
          noteSpace: true
        },
        {
          id: '3',
          title: 'กฎข้อที่ 3 ของนิวตัน',
          type: 'example',
          content: 'แรงกระทำและแรงปฏิกิริยา มีขนาดเท่ากันแต่ทิศทางตรงกันข้าม',
          duration: 30,
          keyTerms: ['แรงกระทำ', 'แรงปฏิกิริยา'],
          noteSpace: false
        }
      ],
      activities: [
        {
          id: '1',
          title: 'ทดลองกับลูกบอล',
          type: 'demonstration',
          description: 'สาธิตกฎของนิวตันด้วยลูกบอล',
          duration: 30,
          materials: ['ลูกบอล', 'โต๊ะ', 'ไม้บรรทัด'],
          instructions: [
            'วางลูกบอลบนโต๊ะ',
            'สังเกตการเคลื่อนที่',
            'ผลักลูกบอลด้วยแรงต่างๆ',
            'บันทึกผล'
          ]
        },
        {
          id: '2',
          title: 'คำนวณแรงร่วมกัน',
          type: 'group',
          description: 'แบ่งกลุ่มคำนวณแรงในสถานการณ์ต่างๆ',
          duration: 45,
          materials: ['เครื่องคิดเลข', 'กระดาษกราฟ', 'ดินสอ'],
          instructions: [
            'แบ่งกลุ่ม 4-5 คน',
            'รับโจทย์จากอาจารย์',
            'คำนวณร่วมกัน',
            'นำเสนอผล'
          ]
        }
      ],
      exercises: [
        {
          id: '1',
          type: 'multiple-choice',
          question: 'กฎข้อใดของนิวตันที่เกี่ยวข้องกับความเฉื่อย?',
          options: ['ข้อที่ 1', 'ข้อที่ 2', 'ข้อที่ 3', 'ทุกข้อ'],
          difficulty: 'easy',
          points: 1,
          answerSpace: 1
        },
        {
          id: '2',
          type: 'short-answer',
          question: 'ถ้าแรงที่กระทำต่อวัตถุ 10 N และมวลของวัตถุ 2 kg ความเร่งเท่าไร?',
          difficulty: 'medium',
          points: 2,
          answerSpace: 3
        },
        {
          id: '3',
          type: 'essay',
          question: 'อธิบายการประยุกต์ใช้กฎของนิวตันในชีวิتประจำวัน ยกตัวอย่าง 3 กรณี',
          difficulty: 'hard',
          points: 5,
          answerSpace: 10
        }
      ],
      images: [
        {
          id: '1',
          description: 'แผนภาพแสดงแรงกระทำต่อวัตถุ',
          keywords: ['แรง', 'วัตถุ', 'แผนภาพ'],
          suggested: true
        },
        {
          id: '2',
          description: 'กราฟแสดงความสัมพันธ์ระหว่างแรงและความเร่ง',
          keywords: ['กราฟ', 'แรง', 'ความเร่ง'],
          suggested: true
        }
      ],
      summary: 'กฏของนิวตันเป็นพื้นฐานสำคัญของฟิสิกส์ที่อธิบายการเคลื่อนที่ของวัตถุ การเข้าใจและสามารถประยุกต์ใช้ได้จะช่วยในการแก้ปัญหาฟิสิกส์ขั้นสูงต่อไป',
      metadata: {
        pageCount: 15,
        totalDuration: 240,
        difficultyLevel: 'ม.4',
        sectionCount: 3,
        exerciseCount: 3,
        activityCount: 2
      }
    }

    it('should generate PDF for complex content with multiple sections', async () => {
      const element = document.createElement('div')
      const result = await exportService.exportToPDF(complexContent, element)

      expect(result.success).toBe(true)
      expect(result.fileName).toContain('ฟิสิกส์ขั้นสูง')
      expect(mockPdfInstance.setProperties).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'ฟิสิกส์ขั้นสูง - กลศาสตร์',
          subject: 'ชีทเรียนจาก GenCouce - Login-Learning'
        })
      )
    })

    it('should handle multiple pages for long content', async () => {
      // Mock a tall canvas that would require multiple pages
      global.html2canvas = jest.fn(() => Promise.resolve({
        toDataURL: jest.fn(() => 'data:image/png;base64,test'),
        width: 800,
        height: 2000 // Tall content
      }))

      const element = document.createElement('div')
      const result = await exportService.exportToPDF(complexContent, element)

      expect(result.success).toBe(true)
      // Should call addPage for multi-page content
      expect(mockPdfInstance.addPage).toHaveBeenCalled()
    })
  })

  describe('Content with Images PDF Generation', () => {
    const contentWithImages: StudySheetContent = {
      title: 'ชีววิทยา - โครงสร้างเซลล์',
      objectives: ['เข้าใจโครงสร้างของเซลล์'],
      mainContent: [
        {
          id: '1',
          title: 'โครงสร้างเซลล์สัตว์',
          type: 'explanation',
          content: 'เซลล์สัตว์ประกอบด้วยส่วนต่างๆ ที่สำคัญ',
          duration: 45,
          images: [
            {
              id: '1',
              description: 'ภาพตัดขวางเซลล์สัตว์',
              keywords: ['เซลล์', 'สัตว์', 'โครงสร้าง'],
              suggested: true
            }
          ]
        }
      ],
      activities: [],
      exercises: [],
      images: [
        {
          id: '1',
          description: 'เปรียบเทียบเซลล์สัตว์และพืช',
          keywords: ['เซลล์', 'เปรียบเทียb'],
          suggested: true
        },
        {
          id: '2',
          description: 'ภาพถ่ายกล้องจุลทรรศน์',
          keywords: ['กล้องจุลทรรศน์', 'ภาพถ่าย'],
          suggested: false
        }
      ],
      summary: 'การเข้าใจโครงสร้างเซลล์เป็นพื้นฐานของชีววิทยา',
      metadata: {
        pageCount: 6,
        totalDuration: 180,
        difficultyLevel: 'ม.2',
        sectionCount: 1,
        exerciseCount: 0,
        activityCount: 0
      }
    }

    it('should generate PDF with image placeholders', async () => {
      const options: ExportOptions = {
        format: 'pdf',
        includeImages: true,
        pageSize: 'A4',
        orientation: 'portrait',
        quality: 'high',
        watermark: true
      }

      const element = document.createElement('div')
      const result = await exportService.exportToPDF(contentWithImages, element, options)

      expect(result.success).toBe(true)
      expect(result.fileName).toContain('ชีววิทยา')
    })

    it('should handle PDF generation without images', async () => {
      const options: ExportOptions = {
        format: 'pdf',
        includeImages: false,
        pageSize: 'A4',
        orientation: 'portrait',
        quality: 'medium',
        watermark: true
      }

      const element = document.createElement('div')
      const result = await exportService.exportToPDF(contentWithImages, element, options)

      expect(result.success).toBe(true)
    })
  })

  describe('Different Page Sizes and Orientations', () => {
    const standardContent: StudySheetContent = {
      title: 'ทดสอบขนาดหน้า',
      objectives: ['ทดสอบ'],
      mainContent: [{
        id: '1',
        title: 'เนื้อหาทดสอบ',
        type: 'theory',
        content: 'เนื้อหาสำหรับทดสอบขนาดหน้า',
        duration: 30
      }],
      activities: [],
      exercises: [],
      images: [],
      summary: 'สรุป',
      metadata: {
        pageCount: 1,
        totalDuration: 30,
        difficultyLevel: 'ม.1',
        sectionCount: 1,
        exerciseCount: 0,
        activityCount: 0
      }
    }

    it('should generate A4 portrait PDF', async () => {
      const options: ExportOptions = {
        format: 'pdf',
        includeImages: true,
        pageSize: 'A4',
        orientation: 'portrait',
        quality: 'medium',
        watermark: true
      }

      const element = document.createElement('div')
      const result = await exportService.exportToPDF(standardContent, element, options)

      expect(result.success).toBe(true)
      expect(mockJsPDF).toHaveBeenCalledWith(
        expect.objectContaining({
          orientation: 'portrait',
          format: 'a4'
        })
      )
    })

    it('should generate A4 landscape PDF', async () => {
      const options: ExportOptions = {
        format: 'pdf',
        includeImages: true,
        pageSize: 'A4',
        orientation: 'landscape',
        quality: 'medium',
        watermark: true
      }

      const element = document.createElement('div')
      const result = await exportService.exportToPDF(standardContent, element, options)

      expect(result.success).toBe(true)
      expect(mockJsPDF).toHaveBeenCalledWith(
        expect.objectContaining({
          orientation: 'landscape',
          format: 'a4'
        })
      )
    })

    it('should generate Letter size PDF', async () => {
      const options: ExportOptions = {
        format: 'pdf',
        includeImages: true,
        pageSize: 'Letter',
        orientation: 'portrait',
        quality: 'medium',
        watermark: true
      }

      const element = document.createElement('div')
      const result = await exportService.exportToPDF(standardContent, element, options)

      expect(result.success).toBe(true)
      expect(mockJsPDF).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'letter'
        })
      )
    })

    it('should generate A3 size PDF', async () => {
      const options: ExportOptions = {
        format: 'pdf',
        includeImages: true,
        pageSize: 'A3',
        orientation: 'portrait',
        quality: 'high',
        watermark: true
      }

      const element = document.createElement('div')
      const result = await exportService.exportToPDF(standardContent, element, options)

      expect(result.success).toBe(true)
      expect(mockJsPDF).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'a3'
        })
      )
    })
  })

  describe('Quality Settings', () => {
    const testContent: StudySheetContent = {
      title: 'ทดสอบคุณภาพ',
      objectives: ['ทดสอบ'],
      mainContent: [{
        id: '1',
        title: 'เนื้อหา',
        type: 'theory',
        content: 'เนื้อหาทดสอบ',
        duration: 30
      }],
      activities: [],
      exercises: [],
      images: [],
      summary: 'สรุป',
      metadata: {
        pageCount: 1,
        totalDuration: 30,
        difficultyLevel: 'ม.1',
        sectionCount: 1,
        exerciseCount: 0,
        activityCount: 0
      }
    }

    it('should generate high quality PDF', async () => {
      const options: ExportOptions = {
        format: 'pdf',
        includeImages: true,
        pageSize: 'A4',
        orientation: 'portrait',
        quality: 'high',
        watermark: true
      }

      global.html2canvas = jest.fn(() => Promise.resolve({
        toDataURL: jest.fn(() => 'data:image/png;base64,test'),
        width: 800,
        height: 600
      }))

      const element = document.createElement('div')
      await exportService.exportToPDF(testContent, element, options)

      // High quality should use higher scale
      expect(global.html2canvas).toHaveBeenCalledWith(
        element,
        expect.objectContaining({
          scale: 2
        })
      )
    })

    it('should generate low quality PDF for better performance', async () => {
      const options: ExportOptions = {
        format: 'pdf',
        includeImages: true,
        pageSize: 'A4',
        orientation: 'portrait',
        quality: 'low',
        watermark: true
      }

      const element = document.createElement('div')
      await exportService.exportToPDF(testContent, element, options)

      // Low quality should use lower scale
      expect(global.html2canvas).toHaveBeenCalledWith(
        element,
        expect.objectContaining({
          scale: 1
        })
      )
    })
  })

  describe('Branding Integration', () => {
    const brandingContent: StudySheetContent = {
      title: 'ทดสอบแบรนด์',
      objectives: ['ทดสอบแบรนด์'],
      mainContent: [{
        id: '1',
        title: 'เนื้อหา',
        type: 'theory',
        content: 'เนื้อหาทดสอบแบรนด์',
        duration: 30
      }],
      activities: [],
      exercises: [],
      images: [],
      summary: 'สรุป',
      metadata: {
        pageCount: 1,
        totalDuration: 30,
        difficultyLevel: 'ม.1',
        sectionCount: 1,
        exerciseCount: 0,
        activityCount: 0
      }
    }

    it('should add Login-Learning branding to PDF', async () => {
      const element = document.createElement('div')
      await exportService.exportToPDF(brandingContent, element)

      // Should add header branding
      expect(mockPdfInstance.setFillColor).toHaveBeenCalledWith(37, 99, 235) // Login-Learning blue
      expect(mockPdfInstance.text).toHaveBeenCalledWith('LOGIN-LEARNING', expect.any(Number), expect.any(Number))
      expect(mockPdfInstance.text).toHaveBeenCalledWith('Study Sheet Generator', expect.any(Number), expect.any(Number))

      // Should add footer branding
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        expect.stringContaining('Login-Learning Co., Ltd.'),
        expect.any(Number),
        expect.any(Number)
      )
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        'www.login-learning.com',
        expect.any(Number),
        expect.any(Number)
      )
    })

    it('should add watermarks when enabled', async () => {
      const options: ExportOptions = {
        format: 'pdf',
        includeImages: true,
        pageSize: 'A4',
        orientation: 'portrait',
        quality: 'medium',
        watermark: true
      }

      const element = document.createElement('div')
      await exportService.exportToPDF(brandingContent, element, options)

      // Should add watermark text
      expect(mockPdfInstance.text).toHaveBeenCalledWith(
        'LOGIN-LEARNING GENCOUCE',
        expect.any(Number),
        expect.any(Number),
        expect.objectContaining({
          angle: -45,
          align: 'center'
        })
      )
    })

    it('should skip watermarks when disabled', async () => {
      const options: ExportOptions = {
        format: 'pdf',
        includeImages: true,
        pageSize: 'A4',
        orientation: 'portrait',
        quality: 'medium',
        watermark: false
      }

      const element = document.createElement('div')
      await exportService.exportToPDF(brandingContent, element, options)

      // Should not add diagonal watermarks (only header/footer branding should be present)
      const diagonalWatermarkCalls = (mockPdfInstance.text as jest.Mock).mock.calls.filter(call => 
        call[3] && call[3].angle === -45
      )
      expect(diagonalWatermarkCalls).toHaveLength(0)
    })
  })
})