import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StudySheetPreview from '@/components/StudySheetPreview'
import { StudySheetContent } from '@/types'

// Mock the export hook
jest.mock('@/hooks/useExport', () => ({
  useExport: jest.fn(() => ({
    isExporting: false,
    exportProgress: 0,
    exportResult: null,
    error: null,
    exportToPDF: jest.fn(() => Promise.resolve(true)),
    exportToWeb: jest.fn(() => Promise.resolve(true)),
    exportToJSON: jest.fn(() => Promise.resolve(true)),
    downloadResult: jest.fn(),
    copyShareUrl: jest.fn(),
    clearResult: jest.fn(),
    clearError: jest.fn()
  }))
}))

const mockContent: StudySheetContent = {
  title: 'พีชคณิตเบื้องต้น',
  objectives: [
    'เข้าใจแนวคิดพื้นฐานของพีชคณิต',
    'สามารถแก้สมการเชิงเส้นได้',
    'ประยุกต์ใช้ในชีวิตประจำวัน'
  ],
  mainContent: [
    {
      id: '1',
      title: 'บทนำพีชคณิต',
      type: 'theory',
      content: 'พีชคณิตเป็นสาขาหนึ่งของคณิตศาสตร์',
      duration: 45,
      keyTerms: ['พีชคณิต', 'ตัวแปร'],
      noteSpace: true
    },
    {
      id: '2',
      title: 'สมการเชิงเส้น',
      type: 'example',
      content: 'x + 3 = 7 คือตัวอย่างของสมการเชิงเส้น',
      duration: 60,
      keyTerms: ['สมการ'],
      noteSpace: false
    }
  ],
  activities: [
    {
      id: '1',
      title: 'แก้สมการร่วมกัน',
      type: 'group',
      description: 'ทำงานเป็นกลุ่มแก้สมการ',
      duration: 30,
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
      description: 'แผนภาพแสดงการแก้สมการ',
      keywords: ['สมการ', 'แผนภาพ'],
      suggested: true
    }
  ],
  summary: 'พีชคณิตเป็นพื้นฐานสำคัญของคณิตศาสตร์',
  metadata: {
    pageCount: 5,
    totalDuration: 240,
    difficultyLevel: 'ม.1',
    sectionCount: 2,
    exerciseCount: 2,
    activityCount: 1
  }
}

describe('StudySheetPreview Component', () => {
  const user = userEvent.setup()
  const mockOnEdit = jest.fn()
  const mockOnExport = jest.fn()
  const mockOnContentChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Content Display', () => {
    it('should display study sheet title and metadata', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      expect(screen.getByText('พีชคณิตเบื้องต้น')).toBeInTheDocument()
      expect(screen.getByText('5 หน้า')).toBeInTheDocument()
      expect(screen.getByText('4 ชั่วโมง 0 นาที')).toBeInTheDocument()
      expect(screen.getByText('2 หัวข้อ')).toBeInTheDocument()
      expect(screen.getByText('2 แบบฝึกหัด')).toBeInTheDocument()
      expect(screen.getByText('1 กิจกรรม')).toBeInTheDocument()
    })

    it('should display all objectives', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      expect(screen.getByText('วัตถุประสงค์การเรียนรู้')).toBeInTheDocument()
      expect(screen.getByText('เข้าใจแนวคิดพื้นฐานของพีชคณิต')).toBeInTheDocument()
      expect(screen.getByText('สามารถแก้สมการเชิงเส้นได้')).toBeInTheDocument()
      expect(screen.getByText('ประยุกต์ใช้ในชีวิตประจำวัน')).toBeInTheDocument()
    })

    it('should display main content sections', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      expect(screen.getByText('เนื้อหาหลัก')).toBeInTheDocument()
      expect(screen.getByText('1. บทนำพีชคณิต')).toBeInTheDocument()
      expect(screen.getByText('2. สมการเชิงเส้น')).toBeInTheDocument()
      expect(screen.getByText('พีชคณิตเป็นสาขาหนึ่งของคณิตศาสตร์')).toBeInTheDocument()
      expect(screen.getByText('ทฤษฎี')).toBeInTheDocument()
      expect(screen.getByText('ตัวอย่าง')).toBeInTheDocument()
    })

    it('should display activities', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      expect(screen.getByText('กิจกรรมการเรียนรู้')).toBeInTheDocument()
      expect(screen.getByText('กิจกรรมที่ 1: แก้สมการร่วมกัน')).toBeInTheDocument()
      expect(screen.getByText('กลุ่ม')).toBeInTheDocument()
      expect(screen.getByText('30 นาที')).toBeInTheDocument()
    })

    it('should display exercises', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      expect(screen.getByText('แบบฝึกหัด (2 ข้อ)')).toBeInTheDocument()
      expect(screen.getByText('x + 2 = 5, x เท่ากับเท่าไร?')).toBeInTheDocument()
      expect(screen.getByText('แก้สมการ 2x - 4 = 10')).toBeInTheDocument()
      expect(screen.getByText('ง่าย')).toBeInTheDocument()
      expect(screen.getByText('ปานกลาง')).toBeInTheDocument()
    })

    it('should display summary', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      expect(screen.getByText('สรุปบทเรียน')).toBeInTheDocument()
      expect(screen.getByText('พีชคณิตเป็นพื้นฐานสำคัญของคณิตศาสตร์')).toBeInTheDocument()
    })

    it('should display suggested images', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      expect(screen.getByText('ภาพประกอบที่แนะนำ')).toBeInTheDocument()
      expect(screen.getByText('แผนภาพแสดงการแก้สมการ')).toBeInTheDocument()
    })
  })

  describe('Interactive Features', () => {
    it('should call onEdit when edit button is clicked', async () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
          enableEditing={true}
        />
      )

      const editButton = screen.getByRole('button', { name: /แก้ไข/ })
      await user.click(editButton)

      expect(mockOnEdit).toHaveBeenCalledTimes(1)
    })

    it('should not show edit button when editing is disabled', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
          enableEditing={false}
        />
      )

      expect(screen.queryByRole('button', { name: /แก้ไข/ })).not.toBeInTheDocument()
    })

    it('should open export options when export button is clicked', async () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      const exportButton = screen.getByRole('button', { name: /ส่งออก/ })
      await user.click(exportButton)

      // Should open export options modal
      await waitFor(() => {
        expect(screen.getByText(/ตั้งค่าการส่งออก/)).toBeInTheDocument()
      })
    })

    it('should disable export button when exporting', () => {
      const useExportMock = require('@/hooks/useExport').useExport
      useExportMock.mockReturnValue({
        isExporting: true,
        exportProgress: 50,
        exportResult: null,
        error: null,
        exportToPDF: jest.fn(),
        exportToWeb: jest.fn(),
        exportToJSON: jest.fn(),
        downloadResult: jest.fn(),
        copyShareUrl: jest.fn(),
        clearResult: jest.fn(),
        clearError: jest.fn()
      })

      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      const exportButton = screen.getByRole('button', { name: /กำลังส่งออก/ })
      expect(exportButton).toBeDisabled()
    })
  })

  describe('Branding Integration', () => {
    it('should display Login-Learning logo and branding', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      expect(screen.getByText('STUDY SHEET GENERATOR')).toBeInTheDocument()
      expect(screen.getByText('Powered by AI Technology')).toBeInTheDocument()
    })

    it('should use Login-Learning color scheme', () => {
      const { container } = render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      // Check for Login-Learning branded colors
      const brandedElements = container.querySelectorAll('.bg-login-learning-600, .text-login-learning-800, .border-login-learning-200')
      expect(brandedElements.length).toBeGreaterThan(0)
    })
  })

  describe('Content Sections', () => {
    it('should display key terms for sections that have them', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      expect(screen.getByText('คำศัพท์สำคัญ:')).toBeInTheDocument()
      expect(screen.getByText('พีชคณิต')).toBeInTheDocument()
      expect(screen.getByText('ตัวแปร')).toBeInTheDocument()
    })

    it('should show note space indicators', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      expect(screen.getByText('💭 พื้นที่สำหรับจดโน้ต...')).toBeInTheDocument()
    })

    it('should display duration for each section', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      expect(screen.getByText('⏱️ 45 นาที')).toBeInTheDocument()
      expect(screen.getByText('⏱️ 60 นาที')).toBeInTheDocument()
    })
  })

  describe('Exercise Display', () => {
    it('should show multiple choice options', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      // Check for multiple choice markers
      expect(screen.getByText('a')).toBeInTheDocument() // Option marker
      expect(screen.getByText('b')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument() // Answer options
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('should display answer spaces', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      expect(screen.getByText('✏️ พื้นที่สำหรับตอบ (1 บรรทัด)...')).toBeInTheDocument()
      expect(screen.getByText('✏️ พื้นที่สำหรับตอบ (3 บรรทัด)...')).toBeInTheDocument()
    })

    it('should display exercise difficulty levels', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      expect(screen.getByText('ง่าย')).toBeInTheDocument()
      expect(screen.getByText('ปานกลาง')).toBeInTheDocument()
    })

    it('should display exercise points', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      expect(screen.getByText('1 คะแนน')).toBeInTheDocument()
      expect(screen.getByText('2 คะแนน')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should render correctly on mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375 })
      
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      // Should still display main content
      expect(screen.getByText('พีชคณิตเบื้องต้น')).toBeInTheDocument()
      expect(screen.getByText('เนื้อหาหลัก')).toBeInTheDocument()
    })

    it('should stack action buttons on small screens', () => {
      const { container } = render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
          enableEditing={true}
        />
      )

      // Check for responsive classes
      const buttonContainer = container.querySelector('.flex.flex-col.sm\\:flex-row')
      expect(buttonContainer).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      // Check for proper headings hierarchy
      expect(screen.getByRole('heading', { level: 3, name: /วัตถุประสงค์การเรียนรู้/ })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: /เนื้อหาหลัก/ })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: /กิจกรรมการเรียนรู้/ })).toBeInTheDocument()
    })

    it('should have accessible button labels', () => {
      render(
        <StudySheetPreview 
          content={mockContent}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
          enableEditing={true}
        />
      )

      expect(screen.getByRole('button', { name: /แก้ไข/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /ส่งออก/ })).toBeInTheDocument()
    })
  })

  describe('Content Variations', () => {
    it('should handle content with no activities', () => {
      const contentWithoutActivities = {
        ...mockContent,
        activities: []
      }

      render(
        <StudySheetPreview 
          content={contentWithoutActivities}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      expect(screen.queryByText('กิจกรรมการเรียนรู้')).not.toBeInTheDocument()
    })

    it('should handle content with no exercises', () => {
      const contentWithoutExercises = {
        ...mockContent,
        exercises: []
      }

      render(
        <StudySheetPreview 
          content={contentWithoutExercises}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      expect(screen.queryByText('แบบฝึกหัด')).not.toBeInTheDocument()
    })

    it('should handle content with no images', () => {
      const contentWithoutImages = {
        ...mockContent,
        images: []
      }

      render(
        <StudySheetPreview 
          content={contentWithoutImages}
          onEdit={mockOnEdit}
          onExport={mockOnExport}
          onContentChange={mockOnContentChange}
        />
      )

      expect(screen.queryByText('ภาพประกอบที่แนะนำ')).not.toBeInTheDocument()
    })
  })
})