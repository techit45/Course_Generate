# Realtime Preview System Documentation

## Overview

The Realtime Preview System provides users with instant visual feedback as they fill out the study sheet generation form. The preview updates dynamically as users type, showing estimated content structure, page counts, time distribution, and other key metrics before AI generation.

## Architecture

### Core Components

1. **useRealtimePreview Hook** (`/src/hooks/useRealtimePreview.ts`)
   - Debounced form data processing (300ms delay)
   - Content specification calculation
   - Preview data generation and caching
   - Error handling and fallback states

2. **RealtimePreview Component** (`/src/components/RealtimePreview.tsx`)
   - Visual preview interface with Login-Learning styling
   - Real-time statistics and metrics display
   - Content structure visualization
   - Responsive design with mobile support

3. **MobilePreviewToggle Component** (`/src/components/ui/MobilePreviewToggle.tsx`)
   - Collapsible mobile preview interface
   - Toggle functionality for space efficiency
   - Smooth animations and transitions

4. **Integrated Layout** (Updated `StudySheetForm.tsx`)
   - Side-by-side desktop layout (form + preview)
   - Mobile-responsive with toggle functionality
   - Seamless transition between preview and AI results

## Features

### Real-time Updates

The preview system updates automatically when users:
- Type in the topic field
- Select different grade levels
- Change content amount preferences
- Adjust exercise amount settings

**Debouncing**: 300ms delay prevents excessive calculations while maintaining responsiveness.

### Content Estimation

#### Page Count Calculation
- **น้อย**: 10-15 pages
- **ปานกลาง**: 20-30 pages  
- **มาก**: 35-40 pages

#### Time Distribution (4-hour sessions)
```typescript
// Example for "ปานกลาง" content:
{
  introduction: 24 minutes (10%)
  mainContent: 132 minutes (55%)
  activities: 48 minutes (20%)
  exercises: 29 minutes (12%)
  summary: 7 minutes (3%)
}
```

#### Section Structure Preview
- Dynamic section titles based on topic
- Grade-appropriate complexity levels
- Estimated duration per section
- Content type classification (theory, explanation, example, practice, summary)

#### Exercise Type Distribution
- **Multiple Choice** (40% of exercises)
- **Short Answer** (30% of exercises)
- **Essay** (20% of exercises)
- **True/False** (10% of exercises)

#### Difficulty Distribution by Grade
| Grade | Easy | Medium | Hard |
|-------|------|--------|------|
| ม.1 | 60% | 35% | 5% |
| ม.2 | 50% | 40% | 10% |
| ม.3 | 40% | 45% | 15% |
| ม.4 | 30% | 50% | 20% |
| ม.5 | 25% | 50% | 25% |
| ม.6 | 20% | 50% | 30% |

### Visual Design

#### Login-Learning Theme Integration
- **Primary Colors**: Blue gradient scheme (#1E40AF to #3B82F6)
- **Typography**: Kanit for headings, Sarabun for body text
- **Icons**: Educational icons with consistent styling
- **Cards**: Subtle gradients and borders
- **Progress Bars**: Color-coded by category

#### Layout Features
- **Desktop**: Side-by-side form and preview (50/50 split)
- **Mobile**: Collapsible preview with toggle button
- **Animations**: Smooth transitions and hover effects
- **Live Indicator**: Pulsing green dot with "Live" label

### Component Structure

#### Quick Statistics Cards
```typescript
{
  estimatedPages: number,
  estimatedDuration: "Xh Ym",
  sectionCount: number,
  exerciseCount: number
}
```

#### Grade Information Panel
- Age range display
- Complexity level description
- Vocabulary appropriateness
- Learning style recommendations

#### Time Allocation Visualization
- Visual progress bars for each phase
- Minute breakdown with percentages
- Color-coded phases (introduction, content, activities, exercises, summary)

#### Content Structure Preview
- Numbered section list with types
- Duration estimates per section
- Description of section content
- Color-coded section types

#### Exercise Types Breakdown
- Count per exercise type
- Difficulty level indication
- Visual distribution grid

#### Activity Planning
- Activity titles with topic integration
- Activity type classification
- Duration estimates
- Learning objective alignment

## Technical Implementation

### Data Flow

1. **Form Input** → User types in form fields
2. **Debouncing** → 300ms delay to prevent excessive updates
3. **Specification Calculation** → Content specs generated based on inputs
4. **Preview Generation** → Visual preview data created
5. **UI Update** → Preview component re-renders with new data

### Performance Optimizations

#### Debouncing Strategy
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedFormData(formData);
  }, 300); // 300ms debounce
  
  return () => clearTimeout(timer);
}, [formData]);
```

#### Memoization
- `useMemo` for expensive calculations
- Prevents unnecessary re-renders
- Caches preview data when inputs unchanged

#### Error Handling
- Graceful fallback for invalid inputs
- Console error logging for debugging
- User-friendly placeholder states

### Responsive Design

#### Desktop Layout (lg: 1024px+)
- Two-column grid layout
- Fixed preview panel with sticky positioning
- Full preview visibility

#### Mobile Layout (< 1024px)
- Single column with collapsible preview
- Toggle button for space efficiency
- Smooth expand/collapse animations

### Integration Points

#### Form Integration
```typescript
const watchedValues = watch(); // React Hook Form
<RealtimePreview formData={watchedValues} />
```

#### State Management
- No additional state management required
- Direct integration with form state
- Real-time reactivity through React Hook Form

## Usage Examples

### Basic Implementation
```tsx
import RealtimePreview from '@/components/RealtimePreview';
import { useForm } from 'react-hook-form';

const MyForm = () => {
  const { watch } = useForm();
  const formData = watch();
  
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <FormComponent />
      <RealtimePreview formData={formData} />
    </div>
  );
};
```

### Mobile Integration
```tsx
import MobilePreviewToggle from '@/components/ui/MobilePreviewToggle';

const MobileView = ({ formData }) => (
  <div className="lg:hidden">
    <MobilePreviewToggle formData={formData} />
  </div>
);
```

## Future Enhancements

### Planned Features

1. **Preview Customization**
   - User preference for preview sections
   - Collapsible section groups
   - Compact vs. detailed view modes

2. **Enhanced Calculations**
   - More accurate time estimates
   - Subject-specific adjustments
   - School schedule integration

3. **Interactive Elements**
   - Clickable preview sections
   - Direct editing from preview
   - Drag-and-drop reordering

4. **Export Preview**
   - Preview of PDF layout
   - Web format preview
   - Print-friendly view

### Technical Improvements

1. **Performance**
   - Virtual scrolling for large previews
   - Background calculation workers
   - Progressive loading of preview sections

2. **Accessibility**
   - Screen reader optimization
   - Keyboard navigation support
   - High contrast mode

3. **Analytics**
   - Preview interaction tracking
   - User preference analysis
   - Performance metrics

## Testing Strategy

### Unit Tests
- Hook functionality testing
- Component rendering validation
- Data transformation accuracy
- Error handling verification

### Integration Tests
- Form-preview synchronization
- Mobile toggle functionality
- Responsive layout validation
- Performance benchmarking

### User Experience Tests
- Usability testing with educators
- Response time measurements
- Mobile device compatibility
- Accessibility compliance

## Browser Support

### Compatibility
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Fallbacks
- Graceful degradation for older browsers
- CSS fallbacks for advanced features
- Progressive enhancement strategy

## Performance Metrics

### Target Performance
- **Initial Render**: < 100ms
- **Update Delay**: 300ms (debounced)
- **Animation Duration**: 200-300ms
- **Memory Usage**: < 10MB additional

### Monitoring
- Real-time performance tracking
- Error rate monitoring
- User engagement metrics
- Load time optimization