import { ExportService } from '@/services/exportService'
import { StudySheetContent } from '@/types'

describe('Web Export Functionality Across Browsers', () => {
  let exportService: ExportService
  let mockProgressCallback: jest.Mock

  beforeEach(() => {
    exportService = ExportService.getInstance()
    mockProgressCallback = jest.fn()
    exportService.setProgressCallback(mockProgressCallback)
    jest.clearAllMocks()
  })

  const sampleContent: StudySheetContent = {
    title: 'การแชร์เว็บ - ทดสอบ',
    objectives: ['เข้าใจการแชร์', 'ทดสอบการทำงาน'],
    mainContent: [
      {
        id: '1',
        title: 'บทนำ',
        type: 'theory',
        content: 'เนื้อหาสำหรับการทดสอบการแชร์เว็บ',
        duration: 30,
        keyTerms: ['แชร์', 'เว็บ'],
        noteSpace: true
      }
    ],
    activities: [
      {
        id: '1',
        title: 'กิจกรรมทดสอบ',
        type: 'individual',
        description: 'ทดสอบการทำงานของระบบแชร์',
        duration: 15,
        materials: ['คอมพิวเตอร์', 'อินเทอร์เน็ต'],
        instructions: ['เปิดเว็บ', 'ทดสอบการแชร์']
      }
    ],
    exercises: [
      {
        id: '1',
        type: 'multiple-choice',
        question: 'การแชร์เว็บช่วยอะไร?',
        options: ['แชร์ข้อมูล', 'ประหยัดเวลา', 'เข้าถึงได้ทุกที่', 'ทั้งหมด'],
        difficulty: 'easy',
        points: 1,
        answerSpace: 1
      }
    ],
    images: [
      {
        id: '1',
        description: 'ภาพตัวอย่างการแชร์เว็บ',
        keywords: ['แชร์', 'เว็บ', 'ตัวอย่าง'],
        suggested: true
      }
    ],
    summary: 'การแชร์เว็บเป็นวิธีที่ดีในการเผยแพร่ข้อมูล',
    metadata: {
      pageCount: 3,
      totalDuration: 120,
      difficultyLevel: 'ม.1',
      sectionCount: 1,
      exerciseCount: 1,
      activityCount: 1
    }
  }

  describe('Basic Web Export Functionality', () => {
    it('should export content for web sharing successfully', async () => {
      const result = await exportService.exportToWeb(sampleContent)

      expect(result.success).toBe(true)
      expect(result.downloadUrl).toBeDefined()
      expect(result.shareUrl).toBeDefined()
      expect(result.fileName).toContain('.json')
      expect(result.shareUrl).toContain('gencouce.login-learning.com')
      expect(result.size).toBeGreaterThan(0)
    })

    it('should include complete metadata in web export', async () => {
      // Mock Blob to capture the exported data
      let capturedData: string = ''
      global.Blob = jest.fn((data: string[]) => {
        capturedData = data[0]
        return new Blob(data, { type: 'application/json' })
      }) as any

      await exportService.exportToWeb(sampleContent)

      const exportedData = JSON.parse(capturedData)
      
      expect(exportedData.id).toBeDefined()
      expect(exportedData.title).toBe(sampleContent.title)
      expect(exportedData.content).toEqual(sampleContent)
      expect(exportedData.generatedAt).toBeDefined()
      expect(exportedData.platform).toBe('GenCouce Login-Learning')
      expect(exportedData.version).toBe('1.0')
    })

    it('should generate unique IDs for each export', async () => {
      const result1 = await exportService.exportToWeb(sampleContent)
      const result2 = await exportService.exportToWeb(sampleContent)

      expect(result1.shareUrl).not.toEqual(result2.shareUrl)
    })
  })

  describe('Browser Compatibility Tests', () => {
    describe('Chrome/Chromium Browser Support', () => {
      beforeEach(() => {
        // Mock Chrome user agent
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          writable: true
        })
      })

      it('should work with Chrome clipboard API', async () => {
        const result = await exportService.exportToWeb(sampleContent)
        expect(result.success).toBe(true)

        const copyResult = await exportService.copyToClipboard(result.shareUrl!)
        expect(copyResult).toBe(true)
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(result.shareUrl)
      })

      it('should create proper blob URLs in Chrome', async () => {
        const result = await exportService.exportToWeb(sampleContent)
        
        expect(result.downloadUrl).toBe('mocked-blob-url')
        expect(URL.createObjectURL).toHaveBeenCalled()
      })
    })

    describe('Firefox Browser Support', () => {
      beforeEach(() => {
        // Mock Firefox user agent
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
          writable: true
        })
      })

      it('should work with Firefox clipboard API', async () => {
        const result = await exportService.exportToWeb(sampleContent)
        expect(result.success).toBe(true)

        const copyResult = await exportService.copyToClipboard(result.shareUrl!)
        expect(copyResult).toBe(true)
      })

      it('should handle Firefox blob creation', async () => {
        const result = await exportService.exportToWeb(sampleContent)
        expect(result.success).toBe(true)
        expect(result.downloadUrl).toBeDefined()
      })
    })

    describe('Safari Browser Support', () => {
      beforeEach(() => {
        // Mock Safari user agent
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
          writable: true
        })
      })

      it('should work with Safari limitations', async () => {
        const result = await exportService.exportToWeb(sampleContent)
        expect(result.success).toBe(true)
      })

      it('should handle Safari clipboard fallback', async () => {
        // Mock Safari without clipboard API
        Object.defineProperty(navigator, 'clipboard', {
          value: undefined,
          writable: true
        })

        // Mock document.execCommand for Safari fallback
        document.execCommand = jest.fn(() => true)

        const result = await exportService.exportToWeb(sampleContent)
        const copyResult = await exportService.copyToClipboard(result.shareUrl!)

        expect(copyResult).toBe(true)
        expect(document.execCommand).toHaveBeenCalledWith('copy')
      })
    })

    describe('Edge Browser Support', () => {
      beforeEach(() => {
        // Mock Edge user agent
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
          writable: true
        })
      })

      it('should work with Microsoft Edge', async () => {
        const result = await exportService.exportToWeb(sampleContent)
        expect(result.success).toBe(true)
        expect(result.downloadUrl).toBeDefined()
        expect(result.shareUrl).toBeDefined()
      })
    })

    describe('Mobile Browser Support', () => {
      beforeEach(() => {
        // Mock mobile Chrome user agent
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1',
          writable: true
        })
      })

      it('should work on mobile browsers', async () => {
        const result = await exportService.exportToWeb(sampleContent)
        expect(result.success).toBe(true)
      })

      it('should handle mobile sharing limitations', async () => {
        // Mock mobile without clipboard API
        Object.defineProperty(navigator, 'clipboard', {
          value: undefined,
          writable: true
        })

        const result = await exportService.exportToWeb(sampleContent)
        expect(result.success).toBe(true)

        // Should still create shareable URL even without clipboard
        expect(result.shareUrl).toBeDefined()
      })
    })
  })

  describe('File Download Functionality', () => {
    it('should trigger download properly across browsers', () => {
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
        style: { display: '' }
      }

      const originalCreateElement = document.createElement
      document.createElement = jest.fn((tagName) => {
        if (tagName === 'a') {
          return mockLink as any
        }
        return originalCreateElement.call(document, tagName)
      })

      document.body.appendChild = jest.fn()
      document.body.removeChild = jest.fn()

      exportService.downloadFile('http://test-url.com', 'test-file.json')

      expect(mockLink.href).toBe('http://test-url.com')
      expect(mockLink.download).toBe('test-file.json')
      expect(mockLink.click).toHaveBeenCalled()
      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink)
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink)

      // Restore
      document.createElement = originalCreateElement
    })

    it('should clean up blob URLs after download', async () => {
      jest.useFakeTimers()

      exportService.downloadFile('blob:test-url', 'test.json')

      // Fast forward time to trigger cleanup
      jest.advanceTimersByTime(200)

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url')

      jest.useRealTimers()
    })
  })

  describe('Error Handling', () => {
    it('should handle Blob creation errors', async () => {
      // Mock Blob constructor to throw error
      const originalBlob = global.Blob
      global.Blob = jest.fn(() => {
        throw new Error('Blob creation failed')
      }) as any

      const result = await exportService.exportToWeb(sampleContent)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Blob creation failed')

      // Restore
      global.Blob = originalBlob
    })

    it('should handle URL.createObjectURL errors', async () => {
      // Mock URL.createObjectURL to throw error
      const originalCreateObjectURL = global.URL.createObjectURL
      global.URL.createObjectURL = jest.fn(() => {
        throw new Error('URL creation failed')
      })

      const result = await exportService.exportToWeb(sampleContent)

      expect(result.success).toBe(false)
      expect(result.error).toContain('URL creation failed')

      // Restore
      global.URL.createObjectURL = originalCreateObjectURL
    })

    it('should handle JSON serialization errors', async () => {
      // Create content with circular reference that would cause JSON.stringify to fail
      const problematicContent = {
        ...sampleContent,
        // Add a property that will cause circular reference
      } as any

      // Add circular reference
      problematicContent.circular = problematicContent

      const originalStringify = JSON.stringify
      JSON.stringify = jest.fn(() => {
        throw new Error('JSON serialization failed')
      })

      const result = await exportService.exportToWeb(problematicContent)

      expect(result.success).toBe(false)
      expect(result.error).toContain('JSON serialization failed')

      // Restore
      JSON.stringify = originalStringify
    })
  })

  describe('Progress Reporting', () => {
    it('should report progress during web export', async () => {
      await exportService.exportToWeb(sampleContent)

      expect(mockProgressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          step: 'preparing',
          progress: 0,
          total: 3,
          message: expect.stringContaining('กำลังเตรียมข้อมูลสำหรับการแชร์')
        })
      )

      expect(mockProgressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          step: 'uploading',
          progress: 1,
          total: 3,
          message: expect.stringContaining('กำลังอัพโหลดข้อมูล')
        })
      )

      expect(mockProgressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          step: 'complete',
          progress: 3,
          total: 3,
          message: expect.stringContaining('เสร็จสมบูรณ์')
        })
      )
    })
  })

  describe('File Size and Performance', () => {
    it('should report correct file size', async () => {
      const result = await exportService.exportToWeb(sampleContent)

      expect(result.size).toBeGreaterThan(0)
      expect(typeof result.size).toBe('number')
    })

    it('should format file sizes correctly', () => {
      expect(exportService.formatFileSize(0)).toBe('0 Bytes')
      expect(exportService.formatFileSize(500)).toBe('500 Bytes')
      expect(exportService.formatFileSize(1024)).toBe('1 KB')
      expect(exportService.formatFileSize(1536)).toBe('1.5 KB')
      expect(exportService.formatFileSize(1048576)).toBe('1 MB')
      expect(exportService.formatFileSize(2097152)).toBe('2 MB')
    })

    it('should handle large content exports', async () => {
      // Create large content
      const largeContent: StudySheetContent = {
        ...sampleContent,
        mainContent: Array.from({ length: 100 }, (_, i) => ({
          id: `${i + 1}`,
          title: `หัวข้อที่ ${i + 1}`,
          type: 'theory' as const,
          content: `เนื้อหาขนาดใหญ่สำหรับการทดสอบ หัวข้อที่ ${i + 1} `.repeat(10),
          duration: 30
        })),
        exercises: Array.from({ length: 50 }, (_, i) => ({
          id: `${i + 1}`,
          type: 'multiple-choice' as const,
          question: `คำถามที่ ${i + 1} สำหรับการทดสอบเนื้อหาขนาดใหญ่?`,
          options: [`ตัวเลือก A`, `ตัวเลือก B`, `ตัวเลือก C`, `ตัวเลือก D`],
          difficulty: 'medium' as const,
          points: 2,
          answerSpace: 1
        }))
      }

      const result = await exportService.exportToWeb(largeContent)

      expect(result.success).toBe(true)
      expect(result.size).toBeGreaterThan(10000) // Should be a substantial size
    })
  })

  describe('Share URL Generation', () => {
    it('should generate consistent share URL format', async () => {
      const result = await exportService.exportToWeb(sampleContent)

      expect(result.shareUrl).toMatch(/^https:\/\/gencouce\.login-learning\.com\/share\/sheet-\d+$/)
    })

    it('should generate unique share URLs for different exports', async () => {
      const result1 = await exportService.exportToWeb(sampleContent)
      
      // Wait to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1))
      
      const result2 = await exportService.exportToWeb(sampleContent)

      expect(result1.shareUrl).not.toEqual(result2.shareUrl)
    })
  })
})