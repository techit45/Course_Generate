import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StudySheetForm from '@/components/StudySheetForm'
import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock environment variables
process.env.OPENROUTER_API_KEY = 'test-api-key'

// Mock successful AI response
const mockAIResponse = {
  data: {
    choices: [{
      message: {
        content: JSON.stringify({
          title: 'พีชคณิตเบื้องต้น - ม.1',
          objectives: [
            'เข้าใจแนวคิดพื้นฐานของพีชคณิต',
            'สามารถแก้สมการเชิงเส้นอย่างง่ายได้',
            'ประยุกต์ใช้พีชคณิตในปัญหาในชีวิตประจำวัน'
          ],
          mainContent: [
            {
              id: '1',
              title: 'บทนำพีชคณิต',
              type: 'theory',
              content: 'พีชคณิตเป็นสาขาหนึ่งของคณิตศาสตร์ที่ใช้ตัวอักษรแทนค่าที่ไม่ทราบ',
              duration: 45,
              keyTerms: ['พีชคณิต', 'ตัวแปร', 'สมการ'],
              noteSpace: true
            },
            {
              id: '2',
              title: 'สมการเชิงเส้น',
              type: 'example',
              content: 'สมการเชิงเส้นคือสมการที่มีตัวแปรยกกำลัง 1 เช่น x + 3 = 7',
              duration: 60,
              keyTerms: ['สมการเชิงเส้น'],
              noteSpace: false
            }
          ],
          activities: [
            {
              id: '1',
              title: 'แก้สมการร่วมกัน',
              type: 'group',
              description: 'ทำงานเป็นกลุ่มเพื่อแก้สมการต่างๆ',
              duration: 30,
              materials: ['กระดาษ', 'ดินสอ', 'เครื่องคิดเลข'],
              instructions: [
                'แบ่งกลุ่ม 4-5 คน',
                'แก้สมการที่ได้รับมอบหมาย',
                'นำเสนอวิธีการแก้ต่อหน้าชั้น'
              ]
            }
          ],
          exercises: [
            {
              id: '1',
              type: 'multiple-choice',
              question: 'ถ้า x + 5 = 12 แล้ว x เท่ากับเท่าไร?',
              options: ['5', '7', '12', '17'],
              difficulty: 'easy',
              points: 1,
              answerSpace: 1
            },
            {
              id: '2',
              type: 'short-answer',
              question: 'แก้สมการ 2x - 4 = 10',
              difficulty: 'medium',
              points: 2,
              answerSpace: 3
            }
          ],
          images: [
            {
              id: '1',
              description: 'แผนภาพแสดงการแก้สมการเชิงเส้น',
              keywords: ['สมการ', 'แผนภาพ', 'ตัวอย่าง'],
              suggested: true
            }
          ],
          summary: 'พีชคณิตเป็นเครื่องมือสำคัญในการแก้ปัญหาคณิตศาสตร์ การเข้าใจแนวคิดพื้นฐานจะช่วยให้สามารถประยุกต์ใช้ในสถานการณ์ต่างๆ ได้',
          metadata: {
            pageCount: 8,
            totalDuration: 240,
            difficultyLevel: 'ม.1',
            sectionCount: 2,
            exerciseCount: 2,
            activityCount: 1
          }
        })
      }
    }]
  }
}

describe('StudySheetForm Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedAxios.post.mockResolvedValue(mockAIResponse)
  })

  describe('Complete Form Submission Flow', () => {
    it('should complete full form submission and content generation', async () => {
      render(<StudySheetForm />)

      // Verify initial form state
      expect(screen.getByText('สร้างชีทเรียน')).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/เช่น พีชคณิต เรขาคณิต/)).toBeInTheDocument()

      // Fill in topic
      const topicInput = screen.getByLabelText('หัวข้อการเรียน')
      await user.type(topicInput, 'พีชคณิตเบื้องต้น')

      // Select grade level
      const gradeSelect = screen.getByLabelText('ระดับชั้น')
      await user.selectOptions(gradeSelect, 'ม.1')

      // Select content amount
      const contentMediumOption = screen.getByLabelText(/ปานกลาง.*20-30 หน้า/)
      await user.click(contentMediumOption)

      // Select exercise amount
      const exerciseMediumOption = screen.getByLabelText(/ปานกลาง.*10-15 ข้อ/)
      await user.click(exerciseMediumOption)

      // Verify form validation passed
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /สร้างชีทเรียน/ })
        expect(submitButton).not.toBeDisabled()
      })

      // Submit form
      const submitButton = screen.getByRole('button', { name: /สร้างชีทเรียน/ })
      await user.click(submitButton)

      // Verify loading state
      await waitFor(() => {
        expect(screen.getByText(/กำลังสร้างชีทเรียน/)).toBeInTheDocument()
      })

      // Wait for content generation to complete
      await waitFor(() => {
        expect(screen.getByText(/สำเร็จ!/)).toBeInTheDocument()
      }, { timeout: 10000 })

      // Verify AI API was called with correct parameters
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          model: expect.any(String),
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('พีชคณิตเบื้องต้น')
            })
          ])
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          })
        })
      )

      // Verify generated content is displayed
      await waitFor(() => {
        expect(screen.getByText('พีชคณิตเบื้องต้น - ม.1')).toBeInTheDocument()
      })
    })

    it('should handle form validation errors', async () => {
      render(<StudySheetForm />)

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /สร้างชีทเรียน/ })
      
      // Submit button should be disabled for empty form
      expect(submitButton).toBeDisabled()

      // Fill only topic (missing other required fields)
      const topicInput = screen.getByLabelText('หัวข้อการเรียน')
      await user.type(topicInput, 'a') // Too short
      
      // Should show validation message
      await waitFor(() => {
        expect(screen.getByText(/กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง/)).toBeInTheDocument()
      })
    })

    it('should handle inappropriate topic validation', async () => {
      render(<StudySheetForm />)

      const topicInput = screen.getByLabelText('หัวข้อการเรียน')
      await user.type(topicInput, 'วิธีทำลายโลก') // Inappropriate topic

      // Select other fields
      const gradeSelect = screen.getByLabelText('ระดับชั้น')
      await user.selectOptions(gradeSelect, 'ม.1')

      const contentOption = screen.getByLabelText(/ปานกลาง.*20-30 หน้า/)
      await user.click(contentOption)

      const exerciseOption = screen.getByLabelText(/ปานกลาง.*10-15 ข้อ/)
      await user.click(exerciseOption)

      // Try to submit
      const submitButton = screen.getByRole('button', { name: /สร้างชีทเรียน/ })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('AI Service Integration', () => {
    it('should handle AI service errors gracefully', async () => {
      // Mock AI service error
      mockedAxios.post.mockRejectedValue(new Error('AI service unavailable'))

      render(<StudySheetForm />)

      // Fill form
      await user.type(screen.getByLabelText('หัวข้อการเรียน'), 'คณิตศาสตร์')
      await user.selectOptions(screen.getByLabelText('ระดับชั้น'), 'ม.1')
      await user.click(screen.getByLabelText(/ปานกลาง.*20-30 หน้า/))
      await user.click(screen.getByLabelText(/ปานกลาง.*10-15 ข้อ/))

      // Submit form
      const submitButton = screen.getByRole('button', { name: /สร้างชีทเรียน/ })
      await user.click(submitButton)

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/เกิดข้อผิดพลาด/)).toBeInTheDocument()
        expect(screen.getByText(/AI service unavailable/)).toBeInTheDocument()
      })

      // Should show recovery options
      await waitFor(() => {
        expect(screen.getByText(/ตัวเลือกการแก้ไข/)).toBeInTheDocument()
        expect(screen.getByText(/ลองใหม่ \(โมเดลเดิม\)/)).toBeInTheDocument()
        expect(screen.getByText(/โหมดสำรอง \(ไม่ใช้ AI\)/)).toBeInTheDocument()
      })
    })

    it('should retry with fallback content when AI fails', async () => {
      // Mock AI service error
      mockedAxios.post.mockRejectedValue(new Error('Rate limit exceeded'))

      render(<StudySheetForm />)

      // Fill and submit form
      await user.type(screen.getByLabelText('หัวข้อการเรียน'), 'ฟิสิกส์')
      await user.selectOptions(screen.getByLabelText('ระดับชั้น'), 'ม.2')
      await user.click(screen.getByLabelText(/ปานกลาง.*20-30 หน้า/))
      await user.click(screen.getByLabelText(/ปานกลาง.*10-15 ข้อ/))

      const submitButton = screen.getByRole('button', { name: /สร้างชีทเรียน/ })
      await user.click(submitButton)

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/เกิดข้อผิดพลาด/)).toBeInTheDocument()
      })

      // Click fallback option
      const fallbackButton = screen.getByText(/โหมดสำรอง \(ไม่ใช้ AI\)/)
      await user.click(fallbackButton)

      // Should generate fallback content
      await waitFor(() => {
        expect(screen.getByText(/สำเร็จ!/)).toBeInTheDocument()
        expect(screen.getByText(/สร้างด้วยระบบสำรอง/)).toBeInTheDocument()
      })

      // Should display generated content
      await waitFor(() => {
        expect(screen.getByText('ฟิสิกส์ - ชีทเรียนพื้นฐาน')).toBeInTheDocument()
      })
    })

    it('should handle malformed AI response', async () => {
      // Mock malformed AI response
      mockedAxios.post.mockResolvedValue({
        data: {
          choices: [{
            message: {
              content: 'This is not valid JSON content'
            }
          }]
        }
      })

      render(<StudySheetForm />)

      // Fill and submit form
      await user.type(screen.getByLabelText('หัวข้อการเรียน'), 'เคมี')
      await user.selectOptions(screen.getByLabelText('ระดับชั้น'), 'ม.3')
      await user.click(screen.getByLabelText(/ปานกลาง.*20-30 หน้า/))
      await user.click(screen.getByLabelText(/ปานกลาง.*10-15 ข้อ/))

      const submitButton = screen.getByRole('button', { name: /สร้างชีทเรียน/ })
      await user.click(submitButton)

      // Should show error for malformed response
      await waitFor(() => {
        expect(screen.getByText(/เกิดข้อผิดพลาด/)).toBeInTheDocument()
        expect(screen.getByText(/ไม่สามารถแปลงข้อมูลจาก AI/)).toBeInTheDocument()
      })
    })
  })

  describe('Content Editing Integration', () => {
    it('should allow editing generated content', async () => {
      render(<StudySheetForm />)

      // Generate content first
      await user.type(screen.getByLabelText('หัวข้อการเรียน'), 'ชีววิทยา')
      await user.selectOptions(screen.getByLabelText('ระดับชั้น'), 'ม.1')
      await user.click(screen.getByLabelText(/ปานกลาง.*20-30 หน้า/))
      await user.click(screen.getByLabelText(/ปานกลาง.*10-15 ข้อ/))

      const submitButton = screen.getByRole('button', { name: /สร้างชีทเรียน/ })
      await user.click(submitButton)

      // Wait for content generation
      await waitFor(() => {
        expect(screen.getByText('พีชคณิตเบื้องต้น - ม.1')).toBeInTheDocument()
      })

      // Click edit button
      const editButton = screen.getByRole('button', { name: /แก้ไข/ })
      await user.click(editButton)

      // Should enter edit mode
      await waitFor(() => {
        expect(screen.getByText(/โหมดแก้ไข/)).toBeInTheDocument()
      })
    })

    it('should allow exporting generated content', async () => {
      render(<StudySheetForm />)

      // Generate content first
      await user.type(screen.getByLabelText('หัวข้อการเรียน'), 'ธรรมชาติวิทยา')
      await user.selectOptions(screen.getByLabelText('ระดับชั้น'), 'ม.2')
      await user.click(screen.getByLabelText(/น้อย.*10-15 หน้า/))
      await user.click(screen.getByLabelText(/น้อย.*5-8 ข้อ/))

      const submitButton = screen.getByRole('button', { name: /สร้างชีทเรียน/ })
      await user.click(submitButton)

      // Wait for content generation
      await waitFor(() => {
        expect(screen.getByText('พีชคณิตเบื้องต้น - ม.1')).toBeInTheDocument()
      })

      // Click export button
      const exportButton = screen.getByRole('button', { name: /ส่งออก/ })
      await user.click(exportButton)

      // Export modal should appear
      await waitFor(() => {
        expect(screen.getByText(/ตั้งค่าการส่งออก/)).toBeInTheDocument()
      })
    })
  })

  describe('Form State Management', () => {
    it('should maintain form state during interactions', async () => {
      render(<StudySheetForm />)

      // Fill form
      const topicInput = screen.getByLabelText('หัวข้อการเรียน')
      await user.type(topicInput, 'ภาษาไทย')

      // Change grade level multiple times
      const gradeSelect = screen.getByLabelText('ระดับชั้น')
      await user.selectOptions(gradeSelect, 'ม.1')
      await user.selectOptions(gradeSelect, 'ม.3')

      // Verify final selections
      expect(topicInput).toHaveValue('ภาษาไทย')
      expect(gradeSelect).toHaveValue('ม.3')
    })

    it('should reset form when requested', async () => {
      render(<StudySheetForm />)

      // Fill form completely
      await user.type(screen.getByLabelText('หัวข้อการเรียน'), 'สังคมศึกษา')
      await user.selectOptions(screen.getByLabelText('ระดับชั้น'), 'ม.2')
      await user.click(screen.getByLabelText(/ปานกลาง.*20-30 หน้า/))
      await user.click(screen.getByLabelText(/ปานกลาง.*10-15 ข้อ/))

      // Generate content
      const submitButton = screen.getByRole('button', { name: /สร้างชีทเรียน/ })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('พีชคณิตเบื้องต้น - ม.1')).toBeInTheDocument()
      })

      // Click create new button
      const createNewButton = screen.getByRole('button', { name: /สร้างใหม่/ })
      await user.click(createNewButton)

      // Should return to form
      await waitFor(() => {
        expect(screen.getByText('สร้างชีทเรียน')).toBeInTheDocument()
        expect(screen.queryByText('พีชคณิตเบื้องต้น - ม.1')).not.toBeInTheDocument()
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('should handle mobile interactions', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375 })
      Object.defineProperty(window, 'innerHeight', { value: 667 })

      render(<StudySheetForm />)

      // Should render mobile-optimized form
      expect(screen.getByText('สร้างชีทเรียน')).toBeInTheDocument()
      
      // Mobile preview toggle should be present
      expect(screen.getByRole('button', { name: /ดูตัวอย่าง/ })).toBeInTheDocument()
    })
  })
})