import '@testing-library/jest-dom'

// Mock HTML2Canvas for PDF generation tests
global.html2canvas = jest.fn(() =>
  Promise.resolve({
    toDataURL: () => 'data:image/png;base64,mocked-canvas-data',
    width: 800,
    height: 600,
  })
)

// Mock jsPDF for PDF tests
jest.mock('jspdf', () => {
  const mockJsPDF = jest.fn(() => ({
    addImage: jest.fn(),
    addPage: jest.fn(),
    setProperties: jest.fn(),
    setFillColor: jest.fn(),
    setTextColor: jest.fn(),
    setFont: jest.fn(),
    setFontSize: jest.fn(),
    text: jest.fn(),
    rect: jest.fn(),
    saveGraphicsState: jest.fn(),
    restoreGraphicsState: jest.fn(),
    setGState: jest.fn(),
    output: jest.fn(() => new Blob(['mocked-pdf'], { type: 'application/pdf' })),
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    },
    getTextWidth: jest.fn(() => 50),
    getNumberOfPages: jest.fn(() => 1),
    setPage: jest.fn(),
    GState: jest.fn(),
  }))
  mockJsPDF.GState = jest.fn()
  return mockJsPDF
})

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock window.URL methods
global.URL.createObjectURL = jest.fn(() => 'mocked-blob-url')
global.URL.revokeObjectURL = jest.fn()

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('')),
  },
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Increase test timeout for integration tests
jest.setTimeout(30000)