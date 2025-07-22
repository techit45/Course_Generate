# GenCouce Testing Suite

This directory contains a comprehensive testing suite for the GenCouce Study Sheet Generator application.

## Test Structure

```
__tests__/
├── unit/                           # Unit tests
│   ├── components/                 # Component tests
│   │   └── StudySheetPreview.test.tsx
│   ├── hooks/                      # Hook tests  
│   │   └── useAI.test.tsx
│   └── services/                   # Service tests
│       ├── exportService.test.ts
│       ├── pdfGeneration.test.ts
│       └── webExport.test.ts
├── integration/                    # Integration tests
│   └── StudySheetForm.integration.test.tsx
└── README.md                       # This file
```

## Test Categories

### 1. Unit Tests

#### AI Service Integration (`useAI.test.tsx`)
- ✅ Initial state validation
- ✅ Service status detection (API key configuration)
- ✅ Content generation with various AI responses
- ✅ Error handling (malformed JSON, network errors, rate limiting)
- ✅ Retry functionality with same model and fallback
- ✅ Fallback content generation (non-AI mode)
- ✅ Emergency content generation
- ✅ Content management (clear, update, error handling)
- ✅ Progress tracking during generation

#### Export Service (`exportService.test.ts`)
- ✅ Singleton pattern implementation
- ✅ Device detection (mobile, desktop, unsupported)
- ✅ Safe filename generation with sanitization
- ✅ Progress reporting mechanisms
- ✅ File download functionality
- ✅ Clipboard operations with fallbacks
- ✅ Utility functions (file size formatting)

#### PDF Generation (`pdfGeneration.test.ts`)
- ✅ Simple content PDF generation
- ✅ Complex content with multiple sections
- ✅ Content with images and placeholders
- ✅ Multiple page handling for long content
- ✅ Different page sizes (A4, Letter, A3)
- ✅ Different orientations (portrait, landscape)
- ✅ Quality settings (high, medium, low)
- ✅ Mobile device optimizations
- ✅ Login-Learning branding integration
- ✅ Watermark functionality (enabled/disabled)

#### Web Export (`webExport.test.ts`)
- ✅ Basic web export functionality
- ✅ Complete metadata inclusion
- ✅ Unique ID generation
- ✅ Browser compatibility testing:
  - Chrome/Chromium support
  - Firefox support
  - Safari support (with limitations)
  - Microsoft Edge support
  - Mobile browser support
- ✅ File download functionality across browsers
- ✅ Clipboard API with fallbacks
- ✅ Error handling (Blob creation, URL generation, JSON serialization)
- ✅ Progress reporting
- ✅ File size calculation and performance
- ✅ Share URL generation

#### Component Testing (`StudySheetPreview.test.tsx`)
- ✅ Content display (title, metadata, objectives, sections)
- ✅ Interactive features (edit, export buttons)
- ✅ Login-Learning branding integration
- ✅ Content sections (key terms, note spaces, duration)
- ✅ Exercise display (multiple choice, answer spaces, difficulty)
- ✅ Responsive design behavior
- ✅ Accessibility compliance
- ✅ Content variations handling (empty sections)

### 2. Integration Tests

#### Form Submission Flow (`StudySheetForm.integration.test.tsx`)
- ✅ Complete form submission and content generation
- ✅ Form validation error handling
- ✅ Inappropriate topic validation
- ✅ AI service error handling with recovery options
- ✅ Retry with fallback content when AI fails
- ✅ Malformed AI response handling
- ✅ Content editing integration
- ✅ Export functionality integration
- ✅ Form state management during interactions
- ✅ Form reset functionality
- ✅ Responsive behavior on mobile devices

## Test Coverage Areas

### ✅ Completed Test Coverage

1. **AI Service Integration** - Comprehensive testing of AI content generation, error handling, and fallback mechanisms
2. **PDF Generation** - Various content types, page sizes, quality settings, and branding
3. **Web Export** - Browser compatibility, sharing functionality, and error handling
4. **Form Submission Flow** - End-to-end testing of user interactions and AI integration
5. **Component Rendering** - UI components with proper accessibility and responsiveness
6. **Error Recovery** - Fallback mechanisms and user-friendly error handling
7. **Mobile Optimization** - Device detection and mobile-specific optimizations
8. **Branding Consistency** - Login-Learning branding across all generated materials

### 🎯 Key Testing Requirements (Requirement 11.2)

- **Unit Tests for AI Service**: ✅ Complete with mocking and error scenarios
- **Integration Tests for Form Flow**: ✅ End-to-end user interaction testing
- **PDF Generation Testing**: ✅ Various content types and configurations
- **Cross-Browser Web Export**: ✅ Compatibility testing across major browsers
- **Error Handling**: ✅ Comprehensive error recovery and user feedback
- **Mobile Compatibility**: ✅ Device detection and mobile optimizations
- **Performance Testing**: ✅ Large content handling and optimization testing

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### CI/CD Pipeline
```bash
npm run test:ci
```

## Test Configuration

- **Testing Framework**: Jest with React Testing Library
- **Environment**: jsdom for browser environment simulation
- **Mocking**: Comprehensive mocking for external dependencies
- **Coverage Threshold**: 70% minimum across all metrics
- **Timeout**: 10 seconds for integration tests, 30 seconds for complex operations

## Mock Strategy

### External Dependencies
- **axios**: HTTP requests mocked for AI service calls
- **jsPDF**: PDF generation library mocked for testing
- **html2canvas**: Canvas generation mocked for PDF testing
- **Navigator APIs**: Clipboard, user agent mocking for browser testing
- **URL APIs**: Blob URL creation/revocation mocking

### Component Dependencies
- **Next.js Router**: Navigation mocking for routing tests
- **Custom Hooks**: Export hooks mocked for component testing
- **Environment Variables**: API keys and configuration mocking

## Performance Testing

### Covered Scenarios
- Large content generation (100+ sections, 50+ exercises)
- Mobile device optimizations (lower quality, reduced scale)
- Memory cleanup (URL revocation, canvas cleanup)
- Progress reporting accuracy
- File size calculations for various content sizes

## Browser Compatibility Testing

### Tested Browsers
- **Chrome/Chromium**: Full feature support
- **Firefox**: Full feature support with Mozilla-specific handling
- **Safari**: Limited clipboard API with fallback support
- **Microsoft Edge**: Chromium-based full support
- **Mobile Browsers**: iOS Safari, Android Chrome with limitations

### Tested Features
- PDF generation and download
- Web export and sharing
- Clipboard operations with fallbacks
- Blob URL handling
- File download triggers
- Local storage compatibility

## Accessibility Testing

### Covered Areas
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation
- Screen reader compatibility
- Focus management
- Color contrast (through branding tests)

## Security Testing

### Covered Areas
- Input validation and sanitization
- Safe filename generation
- XSS prevention in content rendering
- API key handling and environment variables
- Content type validation for exports

## Future Testing Enhancements

1. **Visual Regression Testing**: Screenshot comparisons for UI consistency
2. **Performance Benchmarking**: Automated performance metrics collection
3. **Accessibility Automation**: axe-core integration for comprehensive a11y testing
4. **Real Browser Testing**: Selenium/Playwright for actual browser testing
5. **Load Testing**: High-volume concurrent user simulation
6. **Security Scanning**: Automated vulnerability scanning integration

## Test Data Management

### Sample Content
- Simple content for basic functionality testing
- Complex content with all features for comprehensive testing
- Edge cases (empty sections, long text, special characters)
- Various content types (theory, examples, exercises, activities)
- Different difficulty levels and grade levels

### Mock Data Strategy
- Realistic Thai language content for localization testing
- Mathematical notation and special characters
- Large content datasets for performance testing
- Error scenarios and malformed data for robustness testing