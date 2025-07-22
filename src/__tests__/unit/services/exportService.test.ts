import { ExportService, ExportOptions } from '@/services/exportService'
import { StudySheetContent } from '@/types'
import jsPDF from 'jspdf'

// Mock dependencies
jest.mock('jspdf')
jest.mock('html2canvas')

const mockJsPDF = jsPDF as jest.MockedClass<typeof jsPDF>

// Sample study sheet content for testing
const mockStudySheetContent: StudySheetContent = {
  title: 'พีชคณิตเบื้องต้น',
  objectives: [
    'เข้าใจแนวคิดพื้นฐานของพีชคณิต',
    'สามารถแก้สมการเชิงเส้นได้'
  ],
  mainContent: [
    {
      id: '1',
      title: 'บทนำพีชคณิต',
      type: 'theory',
      content: 'พีชคณิตคือสาขาหนึ่งของคณิตศาสตร์ที่ใช้ตัวอักษรแทนจำนวน',
      duration: 30,
      keyTerms: ['พีชคณิต', 'ตัวแปร'],
      noteSpace: true
    }
  ],
  activities: [
    {
      id: '1',
      title: 'แก้สมการร่วมกัน',
      type: 'group',
      description: 'ทำงานเป็นกลุ่มแก้สมการ',
      duration: 20,
      materials: ['กระดาษ', 'ดินสอ'],
      instructions: ['แบ่งกลุ่ม', 'แก้สมการ', 'นำเสนอ']
    }
  ],
  exercises: [
    {
      id: '1',
      type: 'multiple-choice',
      question: 'x + 2 = 5, x เท่ากับเท่าไร?',
      options: ['1', '2', '3', '4'],
      difficulty: 'easy',
      points: 1,
      answerSpace: 1
    }
  ],
  images: [
    {
      id: '1',
      description: 'แผนภาพแสดงการแก้สมการ',
      keywords: ['สมการ', 'แผนภาพ'],
      suggested: true
    }
  ],
  summary: 'พีชคณิตเป็นพื้นฐานสำคัญของคณิตศาสตร์ที่ใช้ในชีวิตประจำวัน',
  metadata: {
    pageCount: 5,
    totalDuration: 240,
    difficultyLevel: 'ม.1',
    sectionCount: 1,
    exerciseCount: 1,
    activityCount: 1
  }
}

describe('ExportService', () => {
  let exportService: ExportService
  let mockProgressCallback: jest.Mock

  beforeEach(() => {
    exportService = ExportService.getInstance()
    mockProgressCallback = jest.fn()
    exportService.setProgressCallback(mockProgressCallback)
    
    // Reset mocks
    jest.clearAllMocks()
    
    // Mock navigator.userAgent for device detection tests
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ExportService.getInstance()
      const instance2 = ExportService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Device Detection', () => {
    it('should detect mobile devices correctly', () => {
      // Test mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      })

      const result = exportService['isMobileDevice']()
      expect(result).toBe(true)
    })

    it('should detect desktop devices correctly', () => {
      // Test desktop user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      })

      const result = exportService['isMobileDevice']()
      expect(result).toBe(false)
    })

    it('should detect unsupported devices', () => {
      // Test old iOS
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/605.1.15'
      })

      const result = exportService['isDeviceSupported']()
      expect(result).toBe(false)
    })
  })

  describe('File Name Generation', () => {
    it('should generate safe filename', () => {
      const filename = exportService.generateFileName(mockStudySheetContent, 'pdf')
      expect(filename).toMatch(/^[\u0E00-\u0E7Fa-zA-Z0-9\s\-_]+-\d{4}-\d{2}-\d{2}\.pdf$/)
      expect(filename).toContain('พีชคณิตเบื้องต้น')
    })

    it('should sanitize special characters in filename', () => {
      const contentWithSpecialChars = {
        ...mockStudySheetContent,
        title: 'Test/Title\\With|Special<>Characters?'
      }
      
      const filename = exportService.generateFileName(contentWithSpecialChars, 'pdf')
      expect(filename).not.toContain('/')
      expect(filename).not.toContain('\\')
      expect(filename).not.toContain('|')
    })
  })

  describe('PDF Export', () => {
    let mockElement: HTMLElement
    let mockCanvas: any

    beforeEach(() => {
      mockElement = document.createElement('div')
      mockCanvas = {
        toDataURL: jest.fn(() => 'data:image/png;base64,test'),
        width: 800,
        height: 600
      }
      
      // Mock html2canvas
      global.html2canvas = jest.fn(() => Promise.resolve(mockCanvas))
      
      // Mock jsPDF instance
      const mockPdfInstance = {
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
      
      mockJsPDF.mockImplementation(() => mockPdfInstance as any)
    })

    it('should export PDF successfully', async () => {
      const options: ExportOptions = {
        format: 'pdf',
        includeImages: true,
        pageSize: 'A4',
        orientation: 'portrait',
        quality: 'medium',
        watermark: true
      }

      const result = await exportService.exportToPDF(mockStudySheetContent, mockElement, options)

      expect(result.success).toBe(true)
      expect(result.downloadUrl).toBeDefined()
      expect(result.fileName).toContain('.pdf')
      expect(mockProgressCallback).toHaveBeenCalled()
    })

    it('should handle PDF export errors', async () => {
      // Make html2canvas throw an error
      global.html2canvas = jest.fn(() => Promise.reject(new Error('Canvas error')))

      const result = await exportService.exportToPDF(mockStudySheetContent, mockElement)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Canvas error')
    })

    it('should apply mobile optimizations', async () => {
      // Set mobile user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
      })

      const options: ExportOptions = {
        format: 'pdf',
        includeImages: true,
        pageSize: 'A4',
        orientation: 'portrait',
        quality: 'high',
        watermark: true
      }

      await exportService.exportToPDF(mockStudySheetContent, mockElement, options)

      // Should call html2canvas with mobile-optimized settings
      expect(global.html2canvas).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({
          scale: 1.2,
          logging: false,
          removeContainer: true
        })
      )
    })

    it('should add Login-Learning branding', async () => {
      const mockPdfInstance = mockJsPDF() as any

      await exportService.exportToPDF(mockStudySheetContent, mockElement)

      // Should add branding elements
      expect(mockPdfInstance.setFillColor).toHaveBeenCalled()
      expect(mockPdfInstance.text).toHaveBeenCalledWith(expect.stringContaining('LOGIN-LEARNING'), expect.any(Number), expect.any(Number))
    })
  })

  describe('Web Export', () => {
    it('should export for web sharing successfully', async () => {
      const result = await exportService.exportToWeb(mockStudySheetContent)

      expect(result.success).toBe(true)
      expect(result.downloadUrl).toBeDefined()
      expect(result.shareUrl).toBeDefined()
      expect(result.shareUrl).toContain('gencouce.login-learning.com')
    })

    it('should handle web export errors', async () => {
      // Mock Blob constructor to throw error
      global.Blob = jest.fn(() => {
        throw new Error('Blob creation failed')
      }) as any

      const result = await exportService.exportToWeb(mockStudySheetContent)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Blob creation failed')
    })
  })

  describe('JSON Export', () => {
    it('should export JSON successfully', async () => {
      const result = await exportService.exportToJSON(mockStudySheetContent)

      expect(result.success).toBe(true)
      expect(result.downloadUrl).toBeDefined()
      expect(result.fileName).toContain('.json')
    })

    it('should include metadata in JSON export', async () => {
      // Mock Blob constructor to capture data
      let jsonData: string
      global.Blob = jest.fn((data: string[]) => {
        jsonData = data[0]
        return new Blob(data, { type: 'application/json' })
      }) as any

      await exportService.exportToJSON(mockStudySheetContent)

      const exportData = JSON.parse(jsonData!)
      expect(exportData.version).toBe('1.0')
      expect(exportData.content).toEqual(mockStudySheetContent)
      expect(exportData.metadata.generator).toBe('GenCouce Study Sheet Generator')
      expect(exportData.metadata.platform).toBe('Login-Learning')
    })
  })

  describe('Utility Functions', () => {
    it('should format file size correctly', () => {
      expect(exportService.formatFileSize(0)).toBe('0 Bytes')
      expect(exportService.formatFileSize(1024)).toBe('1 KB')
      expect(exportService.formatFileSize(1048576)).toBe('1 MB')
      expect(exportService.formatFileSize(1073741824)).toBe('1 GB')
    })

    it('should copy to clipboard successfully', async () => {
      const result = await exportService.copyToClipboard('test text')
      expect(result).toBe(true)
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text')
    })

    it('should handle clipboard copy errors', async () => {
      // Mock clipboard to throw error
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn(() => Promise.reject(new Error('Clipboard error')))
        }
      })

      const result = await exportService.copyToClipboard('test text')
      expect(result).toBe(false)
    })

    it('should trigger download', () => {
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      }
      
      document.createElement = jest.fn((tagName) => {
        if (tagName === 'a') {
          return mockLink as any
        }
        return document.createElement(tagName)
      })
      
      document.body.appendChild = jest.fn()
      document.body.removeChild = jest.fn()

      exportService.downloadFile('http://test-url.com', 'test-file.pdf')

      expect(mockLink.href).toBe('http://test-url.com')
      expect(mockLink.download).toBe('test-file.pdf')
      expect(mockLink.click).toHaveBeenCalled()
      expect(document.body.appendChild).toHaveBeenCalled()
      expect(document.body.removeChild).toHaveBeenCalled()
    })
  })

  describe('Progress Reporting', () => {
    it('should report progress during export', async () => {
      await exportService.exportToPDF(mockStudySheetContent, document.createElement('div'))

      expect(mockProgressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          step: 'preparing',
          progress: 0,
          total: 5,
          message: expect.stringContaining('กำลังเตรียมข้อมูล')
        })
      )

      expect(mockProgressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          step: 'complete',
          progress: 5,
          total: 5,
          message: expect.stringContaining('เสร็จสมบูรณ์')
        })
      )
    })
  })
})