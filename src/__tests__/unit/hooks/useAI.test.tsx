import { renderHook, act, waitFor } from '@testing-library/react'
import { useAI } from '@/hooks/useAI'
import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock console methods to avoid test noise
const originalConsoleError = console.error
const originalConsoleLog = console.log

beforeEach(() => {
  console.error = jest.fn()
  console.log = jest.fn()
  jest.clearAllMocks()
  // Reset axios defaults
  mockedAxios.create.mockReturnValue(mockedAxios)
})

afterEach(() => {
  console.error = originalConsoleError
  console.log = originalConsoleLog
})

describe('useAI Hook', () => {
  const mockAIResponse = {
    data: {
      choices: [{
        message: {
          content: JSON.stringify({
            title: 'พีชคณิตเบื้องต้น',
            objectives: ['เข้าใจแนวคิดพื้นฐานของพีชคณิต'],
            mainContent: [{
              id: '1',
              title: 'บทนำ',
              type: 'theory',
              content: 'พีชคณิตคือสาขาหนึ่งของคณิตศาสตร์',
              duration: 30
            }],
            activities: [],
            exercises: [{
              id: '1',
              type: 'multiple-choice',
              question: 'x + 2 = 5, x เท่ากับเท่าไร?',
              options: ['1', '2', '3', '4'],
              difficulty: 'easy',
              points: 1,
              answerSpace: 1
            }],
            images: [],
            summary: 'พีชคณิตเป็นพื้นฐานสำคัญของคণิตศาสตร์',
            metadata: {
              pageCount: 5,
              totalDuration: 240,
              difficultyLevel: 'ม.1',
              sectionCount: 1,
              exerciseCount: 1,
              activityCount: 0
            }
          })
        }
      }]
    }
  }

  const mockRequest = {
    model: 'test-model',
    messages: [{ role: 'user', content: 'Generate study sheet' }],
    temperature: 0.7,
    max_tokens: 4000
  }

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useAI())

      expect(result.current.content).toBeNull()
      expect(result.current.isGenerating).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.progress).toBe(0)
      expect(result.current.isFallbackMode).toBe(false)
      expect(result.current.serviceStatus.configured).toBe(false)
      expect(result.current.serviceStatus.rateLimitAvailable).toBe(true)
    })
  })

  describe('Service Status', () => {
    it('should detect configured service when API key is present', () => {
      // Mock environment variable
      process.env.OPENROUTER_API_KEY = 'test-api-key'
      
      const { result } = renderHook(() => useAI())
      
      expect(result.current.serviceStatus.configured).toBe(true)
    })

    it('should show unconfigured when no API key', () => {
      delete process.env.OPENROUTER_API_KEY
      
      const { result } = renderHook(() => useAI())
      
      expect(result.current.serviceStatus.configured).toBe(false)
    })
  })

  describe('Content Generation', () => {
    beforeEach(() => {
      process.env.OPENROUTER_API_KEY = 'test-api-key'
      mockedAxios.post.mockResolvedValue(mockAIResponse)
    })

    it('should generate content successfully', async () => {
      const { result } = renderHook(() => useAI())

      await act(async () => {
        const success = await result.current.generateContent(mockRequest)
        expect(success).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.content).not.toBeNull()
        expect(result.current.content?.title).toBe('พีชคณิตเบื้องต้น')
        expect(result.current.isGenerating).toBe(false)
        expect(result.current.error).toBeNull()
        expect(result.current.progress).toBe(100)
      })
    })

    it('should handle malformed JSON response', async () => {
      const malformedResponse = {
        data: {
          choices: [{
            message: {
              content: 'This is not valid JSON'
            }
          }]
        }
      }
      
      mockedAxios.post.mockResolvedValue(malformedResponse)
      
      const { result } = renderHook(() => useAI())

      await act(async () => {
        const success = await result.current.generateContent(mockRequest)
        expect(success).toBe(false)
      })

      await waitFor(() => {
        expect(result.current.error).toContain('ไม่สามารถแปลงข้อมูลจาก AI')
        expect(result.current.content).toBeNull()
      })
    })

    it('should handle network errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network Error'))
      
      const { result } = renderHook(() => useAI())

      await act(async () => {
        const success = await result.current.generateContent(mockRequest)
        expect(success).toBe(false)
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Network Error')
        expect(result.current.isGenerating).toBe(false)
      })
    })

    it('should handle rate limiting', async () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: { error: { message: 'Rate limit exceeded' } }
        }
      }
      
      mockedAxios.post.mockRejectedValue(rateLimitError)
      
      const { result } = renderHook(() => useAI())

      await act(async () => {
        const success = await result.current.generateContent(mockRequest)
        expect(success).toBe(false)
      })

      await waitFor(() => {
        expect(result.current.error).toContain('ใช้งาน AI บ่อยเกินไป')
        expect(result.current.serviceStatus.rateLimitAvailable).toBe(false)
      })
    })

    it('should update progress during generation', async () => {
      // Mock a delayed response to test progress updates
      let resolvePromise: (value: any) => void
      const delayedPromise = new Promise(resolve => {
        resolvePromise = resolve
      })
      
      mockedAxios.post.mockImplementation(() => {
        setTimeout(() => resolvePromise(mockAIResponse), 100)
        return delayedPromise
      })
      
      const { result } = renderHook(() => useAI())
      
      act(() => {
        result.current.generateContent(mockRequest)
      })

      // Check that generation started
      expect(result.current.isGenerating).toBe(true)
      expect(result.current.progress).toBeGreaterThan(0)

      await waitFor(() => {
        expect(result.current.isGenerating).toBe(false)
        expect(result.current.progress).toBe(100)
      })
    })
  })

  describe('Retry Functionality', () => {
    beforeEach(() => {
      process.env.OPENROUTER_API_KEY = 'test-api-key'
    })

    it('should retry generation with same parameters', async () => {
      mockedAxios.post
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce(mockAIResponse)
      
      const { result } = renderHook(() => useAI())

      // First attempt should fail
      await act(async () => {
        const success = await result.current.generateContent(mockRequest)
        expect(success).toBe(false)
      })

      expect(result.current.error).toBe('First attempt failed')

      // Retry should succeed
      await act(async () => {
        const success = await result.current.retryGeneration()
        expect(success).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.content).not.toBeNull()
        expect(result.current.error).toBeNull()
      })
    })

    it('should retry with fallback model', async () => {
      const formData = {
        topic: 'พีชคณิต',
        gradeLevel: 'ม.1' as const,
        contentAmount: 'ปานกลาง' as const,
        exerciseAmount: 'ปานกลาง' as const
      }

      mockedAxios.post.mockResolvedValue(mockAIResponse)
      
      const { result } = renderHook(() => useAI())

      await act(async () => {
        const success = await result.current.retryWithFallback(formData)
        expect(success).toBe(true)
      })

      // Should have called axios with fallback model
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          model: expect.stringContaining('meta-llama')
        }),
        expect.any(Object)
      )
    })
  })

  describe('Fallback Content Generation', () => {
    it('should generate fallback content without AI', async () => {
      const { result } = renderHook(() => useAI())
      
      const formData = {
        topic: 'พีชคณิต',
        gradeLevel: 'ม.1' as const,
        contentAmount: 'ปานกลาง' as const,
        exerciseAmount: 'ปานกลาง' as const
      }

      await act(async () => {
        const success = await result.current.generateFallbackContent(formData)
        expect(success).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.content).not.toBeNull()
        expect(result.current.content?.title).toBe('พีชคณิต - ชีทเรียนพื้นฐาน')
        expect(result.current.isFallbackMode).toBe(true)
      })
    })

    it('should generate emergency content with minimal data', () => {
      const { result } = renderHook(() => useAI())

      act(() => {
        const success = result.current.generateEmergencyContent('คณิตศาสตร์')
        expect(success).toBe(true)
      })

      expect(result.current.content).not.toBeNull()
      expect(result.current.content?.title).toBe('คณิตศาสตร์ - ชีทเรียนเบื้องต้น')
      expect(result.current.isFallbackMode).toBe(true)
    })
  })

  describe('Content Management', () => {
    it('should clear content', () => {
      const { result } = renderHook(() => useAI())
      
      // Set some content first
      act(() => {
        result.current.generateEmergencyContent('Test Topic')
      })
      
      expect(result.current.content).not.toBeNull()

      // Clear content
      act(() => {
        result.current.clearContent()
      })

      expect(result.current.content).toBeNull()
      expect(result.current.isFallbackMode).toBe(false)
    })

    it('should clear errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Test Error'))
      
      const { result } = renderHook(() => useAI())

      await act(async () => {
        await result.current.generateContent(mockRequest)
      })

      expect(result.current.error).toBe('Test Error')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })

    it('should update content', () => {
      const { result } = renderHook(() => useAI())
      
      const newContent = {
        title: 'Updated Title',
        objectives: ['New objective'],
        mainContent: [],
        activities: [],
        exercises: [],
        images: [],
        summary: 'Updated summary',
        metadata: {
          pageCount: 1,
          totalDuration: 60,
          difficultyLevel: 'ม.1',
          sectionCount: 0,
          exerciseCount: 0,
          activityCount: 0
        }
      }

      act(() => {
        result.current.setContent(newContent)
      })

      expect(result.current.content).toEqual(newContent)
    })
  })
})