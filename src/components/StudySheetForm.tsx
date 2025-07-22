'use client';

import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { StudySheetForm as StudySheetFormType, StudySheetContent, GradeLevel, ContentAmount, ExerciseAmount } from '@/types';
import { studySheetValidationRules, customValidations } from '@/utils/validation';
import { useFormState } from '@/hooks/useFormState';
import { useAI, useCreateAIRequest } from '@/hooks/useAI';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import Card from '@/components/ui/Card';
import FormField from '@/components/ui/FormField';
import Alert from '@/components/ui/Alert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProgressBar from '@/components/ui/ProgressBar';
import AdvancedProgressIndicator from '@/components/ui/AdvancedProgressIndicator';
import StudySheetPreview from '@/components/StudySheetPreview';
import StudySheetEditorWithPreview from '@/components/StudySheetEditorWithPreview';
import RealtimePreview from '@/components/RealtimePreview';
import MobilePreviewToggle from '@/components/ui/MobilePreviewToggle';
import ModelSelector from '@/components/ui/ModelSelector';
import BrandedHeader from '@/components/branding/BrandedHeader';
import BrandedFooter from '@/components/branding/BrandedFooter';

const gradeOptions: { value: GradeLevel; label: string }[] = [
  { value: 'ม.1', label: 'มัธยมศึกษาปีที่ 1' },
  { value: 'ม.2', label: 'มัธยมศึกษาปีที่ 2' },
  { value: 'ม.3', label: 'มัธยมศึกษาปีที่ 3' },
  { value: 'ม.4', label: 'มัธยมศึกษาปีที่ 4' },
  { value: 'ม.5', label: 'มัธยมศึกษาปีที่ 5' },
  { value: 'ม.6', label: 'มัธยมศึกษาปีที่ 6' },
];

const contentAmountOptions: { value: ContentAmount; label: string; description?: string }[] = [
  { value: 'น้อย', label: 'น้อย', description: '10-15 หน้า' },
  { value: 'ปานกลาง', label: 'ปานกลาง', description: '20-30 หน้า' },
  { value: 'มาก', label: 'มาก', description: '35-40 หน้า' },
];

const exerciseAmountOptions: { value: ExerciseAmount; label: string; description?: string }[] = [
  { value: 'น้อย', label: 'น้อย', description: '5-8 ข้อ' },
  { value: 'ปานกลาง', label: 'ปานกลาง', description: '10-15 ข้อ' },
  { value: 'มาก', label: 'มาก', description: '20+ ข้อ' },
];

export default function StudySheetForm() {
  const form = useForm<StudySheetFormType>({
    mode: 'onChange', // Validate on change for better UX
    defaultValues: {
      topic: '',
      gradeLevel: 'ม.1',
      contentAmount: 'ปานกลาง',
      exerciseAmount: 'ปานกลาง'
    }
  });

  const { register, watch } = form;
  const watchedValues = watch();
  const createAIRequest = useCreateAIRequest();
  const ai = useAI();
  
  // Performance optimization
  const performance = usePerformanceOptimization({
    maxResponseTime: 3000, // 3 seconds as required
    enableCaching: true,
    enableProgressiveLoading: true,
    enablePerformanceMonitoring: true
  });
  
  // State for editing mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableContent, setEditableContent] = useState<StudySheetContent | null>(null);
  
  // State for AI model selection
  const [selectedModel, setSelectedModel] = useState('meta-llama/llama-3.2-3b-instruct:free');
  
  // State for error recovery options
  const [showRecoveryOptions, setShowRecoveryOptions] = useState(false);
  
  // State for advanced progress
  const [progressStages] = useState([
    {
      id: 'validation',
      label: 'ตรวจสอบข้อมูล',
      description: 'กำลังตรวจสอบความถูกต้องของข้อมูล',
      estimatedDuration: 500
    },
    {
      id: 'cache-check',
      label: 'ตรวจสอบแคช',
      description: 'กำลังค้นหาข้อมูลที่เคยสร้างไว้',
      estimatedDuration: 200
    },
    {
      id: 'ai-generation',
      label: 'สร้างเนื้อหา',
      description: 'กำลังใช้ AI สร้างชีทเรียน',
      estimatedDuration: 15000
    },
    {
      id: 'optimization',
      label: 'ปรับปรุงเนื้อหา',
      description: 'กำลังปรับปรุงและจัดรูปแบบเนื้อหา',
      estimatedDuration: 1000
    },
    {
      id: 'complete',
      label: 'เสร็จสิ้น',
      description: 'ชีทเรียนพร้อมใช้งาน',
      estimatedDuration: 100
    }
  ]);
  
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [currentStageProgress, setCurrentStageProgress] = useState(0);

  const onSubmit = async (data: StudySheetFormType) => {
    console.log('Form submitted:', data);
    
    try {
      // Reset progress
      setCurrentStageIndex(0);
      setCurrentStageProgress(0);

      // Stage 1: Validation
      setCurrentStageIndex(0);
      setCurrentStageProgress(100);
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate validation

      // Stage 2: Cache check
      setCurrentStageIndex(1);
      setCurrentStageProgress(0);
      
      const cacheKey = `${data.topic}-${data.gradeLevel}-${data.contentAmount}-${data.exerciseAmount}`;
      
      // Stage 3: AI Generation with performance optimization
      setCurrentStageIndex(2);
      setCurrentStageProgress(0);
      
      const aiRequest = createAIRequest(
        data.topic,
        data.gradeLevel,
        data.contentAmount,
        data.exerciseAmount
      );

      // Use performance-optimized operation with timeout
      const success = await performance.enforcePerformanceBudget(
        async () => {
          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setCurrentStageProgress(prev => Math.min(90, prev + 10));
          }, 1000);

          try {
            const result = await ai.generateContent(aiRequest, selectedModel);
            clearInterval(progressInterval);
            setCurrentStageProgress(100);
            return result;
          } catch (error) {
            clearInterval(progressInterval);
            throw error;
          }
        },
        // Fallback if AI takes too long
        async () => {
          console.log('Performance budget exceeded, using fallback');
          return ai.generateFallbackContent(data);
        },
        3000 // 3 second timeout as required
      );
      
      if (!success) {
        // Show recovery options when AI fails
        setShowRecoveryOptions(true);
        throw new Error(ai.error || 'เกิดข้อผิดพลาดในการสร้างชีทเรียน');
      }

      // Stage 4: Optimization
      setCurrentStageIndex(3);
      setCurrentStageProgress(0);
      
      // Simulate content optimization
      for (let i = 0; i <= 100; i += 20) {
        setCurrentStageProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Stage 5: Complete
      setCurrentStageIndex(4);
      setCurrentStageProgress(100);
      
      setShowRecoveryOptions(false);
      console.log('Study sheet generated successfully!', ai.content);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setShowRecoveryOptions(true);
      throw error;
    }
  };

  // Error recovery methods
  const handleRetryWithSameModel = async () => {
    const success = await ai.retryGeneration();
    if (success) {
      setShowRecoveryOptions(false);
      formState.setGlobalError(null);
    }
  };

  const handleRetryWithFallback = async () => {
    const formData = watchedValues;
    const success = await ai.retryWithFallback(formData);
    if (success) {
      setShowRecoveryOptions(false);
      formState.setGlobalError(null);
    }
  };

  const handleGenerateFallbackContent = async () => {
    const formData = watchedValues;
    const success = await ai.generateFallbackContent(formData);
    if (success) {
      setShowRecoveryOptions(false);
      formState.setGlobalError(null);
    }
  };

  const handleGenerateEmergencyContent = () => {
    const success = ai.generateEmergencyContent(watchedValues.topic || 'หัวข้อการเรียน');
    if (success) {
      setShowRecoveryOptions(false);
      formState.setGlobalError(null);
    }
  };

  const formState = useFormState({ form, onSubmit });

  // Calculate form completion progress
  const calculateProgress = (): number => {
    const fields = ['topic', 'gradeLevel', 'contentAmount', 'exerciseAmount'];
    const completedFields = fields.filter(field => {
      const value = watchedValues[field as keyof StudySheetFormType];
      return value && value.toString().trim() !== '';
    });
    return (completedFields.length / fields.length) * 100;
  };

  const formProgress = calculateProgress();

  // Handle editing functionality
  const handleEditModeToggle = () => {
    if (!isEditMode) {
      setEditableContent(ai.content);
    }
    setIsEditMode(!isEditMode);
  };

  const handleContentUpdate = (updatedContent: StudySheetContent) => {
    setEditableContent(updatedContent);
  };

  const handleContentSave = () => {
    if (editableContent) {
      // Update the AI content with the edited version
      ai.setContent(editableContent);
    }
    setIsEditMode(false);
  };

  const handleContentCancel = () => {
    setEditableContent(ai.content);
    setIsEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-login-learning-50 to-login-learning-100">
      {/* Main content without branded header initially - will add after form */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Show editor with preview if in edit mode */}
        {isEditMode && editableContent && (
          <StudySheetEditorWithPreview
            content={editableContent}
            onContentChange={handleContentUpdate}
            onSave={handleContentSave}
            onCancel={handleContentCancel}
          />
        )}

        {/* Show full preview if content is generated and not in edit mode */}
        {ai.content && !ai.isGenerating && !isEditMode && (
          <StudySheetPreview 
            content={ai.content}
            onContentChange={handleContentUpdate}
            onEdit={handleEditModeToggle}
            enableEditing={true}
            onExport={(format) => {
              console.log(`Export as ${format} completed`);
            }}
          />
        )}

        {/* Main Layout: Form + Realtime Preview */}
        {(!ai.content || ai.isGenerating) && (
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
            {/* Form Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Branded Header */}
              <div className="bg-gradient-to-r from-login-learning-600 to-blue-600 text-white rounded-xl p-6 sm:p-8 shadow-xl">
                <BrandedHeader 
                  title="Study Sheet Generator"
                  subtitle="เครื่องมือสร้างชีทเรียนสำหรับการสอน 4 ชั่วโมง พัฒนาโดย AI"
                  variant="minimal"
                  showLogo={true}
                  className="bg-transparent p-0 border-0"
                />
              </div>

              {/* Form Card */}
              <Card gradient>
                <div className="mb-4 sm:mb-6 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-login-learning-100 rounded-full mb-2 sm:mb-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-login-learning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-login-learning-800 mb-1 sm:mb-2">
                    สร้างชีทเรียน
                  </h2>
                  <p className="text-login-learning-600 text-sm px-2">
                    กรอกข้อมูลเพื่อสร้างชีทเรียนแบบ AI
                  </p>
                </div>
        
                {/* Progress Indicators */}
                <div className="mb-6">
                  {ai.isGenerating ? (
                    <AdvancedProgressIndicator
                      stages={progressStages}
                      currentStageIndex={currentStageIndex}
                      currentStageProgress={currentStageProgress}
                      totalProgress={ai.progress}
                      showTimeRemaining={true}
                      showPerformanceMetrics={performance.performanceScore < 90}
                      onCancel={() => {
                        performance.cleanup();
                        ai.clearError();
                        ai.clearContent();
                      }}
                    />
                  ) : (
                    <div className="space-y-4">
                      <ProgressBar
                        progress={formProgress}
                        label="ความคืบหน้าการกรอกข้อมูล"
                        showPercentage
                        size="md"
                        animated={formProgress > 0 && formProgress < 100}
                      />
                      
                      {/* Performance Status */}
                      {performance.performanceScore < 90 && (
                        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded px-3 py-2">
                          <span>ประสิทธิภาพระบบ:</span>
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${
                              performance.performanceScore > 80 ? 'bg-green-400' :
                              performance.performanceScore > 60 ? 'bg-yellow-400' : 'bg-red-400'
                            }`} />
                            <span>{performance.performanceScore.toFixed(0)}/100</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Cache Hit Rate */}
                      {ai.cacheHit && (
                        <div className="flex items-center text-xs text-green-600 bg-green-50 rounded px-3 py-2">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          ข้อมูลพบในแคช - โหลดเร็วขึ้น 🚀
                        </div>
                      )}
                    </div>
                  )}
                </div>

      {/* AI Service Status */}
      {!ai.serviceStatus.configured && (
        <Alert
          type="warning"
          title="การตั้งค่า AI ไม่สมบูรณ์"
          className="mb-6"
        >
          กรุณาตั้งค่า API Key ของ OpenRouter ในไฟล์ .env.local
        </Alert>
      )}

      {/* Rate Limit Warning */}
      {ai.serviceStatus.configured && !ai.serviceStatus.rateLimitAvailable && (
        <Alert
          type="warning"
          title="ใช้งาน AI บ่อยเกินไป"
          className="mb-6"
        >
          กรุณารอ {Math.ceil(ai.serviceStatus.waitTime / 1000)} วินาที แล้วลองใหม่
        </Alert>
      )}

      {/* Global Error Alert */}
      {(formState.globalError || ai.error) && (
        <Alert
          type="error"
          title="เกิดข้อผิดพลาด"
          onClose={() => {
            formState.setGlobalError(null);
            ai.clearError();
            setShowRecoveryOptions(false);
          }}
          className="mb-6"
        >
          <div className="space-y-3">
            <p>{formState.globalError || ai.error}</p>
            
            {/* Error Recovery Options */}
            {showRecoveryOptions && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-3">
                <h4 className="font-medium text-red-800 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  ตัวเลือกการแก้ไข
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleRetryWithSameModel}
                    disabled={ai.isGenerating}
                    className="text-xs py-2 px-3 bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    ลองใหม่ (โมเดลเดิม)
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleRetryWithFallback}
                    disabled={ai.isGenerating}
                    className="text-xs py-2 px-3 bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    ลองใหม่ + โหมดสำรอง
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleGenerateFallbackContent}
                    disabled={ai.isGenerating}
                    className="text-xs py-2 px-3 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    โหมดสำรอง (ไม่ใช้ AI)
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleGenerateEmergencyContent}
                    disabled={ai.isGenerating}
                    className="text-xs py-2 px-3 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    เนื้อหาเบื้องต้น
                  </button>
                </div>
                
                <p className="text-xs text-red-600 mt-2">
                  เลือกตัวเลือกข้างต้นเพื่อสร้างชีทเรียนแบบอื่น หรือลองแก้ไขข้อมูลในแบบฟอร์ม
                </p>
              </div>
            )}
          </div>
        </Alert>
      )}

      {/* Success State */}
      {ai.content && !ai.error && !ai.isGenerating && (
        <Alert
          type="success"
          title="สำเร็จ!"
          className="mb-6"
        >
          <div>
            <p>ชีทเรียนเรื่อง "{ai.content.title}" ถูกสร้างเรียบร้อยแล้ว</p>
            
            {ai.isFallbackMode && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  สร้างด้วยระบบสำรอง (ไม่ได้ใช้ AI)
                </p>
              </div>
            )}
            
            <div className="mt-2 text-sm">
              <p>• วัตถุประสงค์: {ai.content.objectives.length} ข้อ</p>
              <p>• เนื้อหาหลัก: {ai.content.mainContent.length} หัวข้อ</p>
              <p>• แบบฝึกหัด: {ai.content.exercises.length} ข้อ</p>
              <p>• กิจกรรม: {ai.content.activities.length} กิจกรรม</p>
            </div>
          </div>
        </Alert>
      )}

      <form onSubmit={formState.handleSubmit} className="space-y-8">
        {/* Topic Input */}
        <FormField 
          label="หัวข้อการเรียน" 
          required 
          error={formState.errors.topic}
          description="กรอกหัวข้อที่ต้องการสร้างชีทเรียน เช่น คณิตศาสตร์ วิทยาศาสตร์ ภาษาไทย"
        >
          <input
            type="text"
            id="topic"
            {...register('topic', {
              ...studySheetValidationRules.topic,
              validate: {
                appropriate: (value) => 
                  customValidations.isTopicAppropriate(value) || 
                  'หัวข้อไม่เหมาะสม กรุณาเลือกหัวข้อที่เกี่ยวข้องกับการศึกษา',
                educational: (value) => 
                  customValidations.isEducationalTopic(value) || 
                  'กรุณากรอกหัวข้อที่เกี่ยวข้องกับการศึกษา'
              }
            })}
            disabled={formState.isSubmitting}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 transition-all duration-200 text-gray-900 placeholder-gray-500 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="เช่น พีชคณิต เรขาคณิต ฟิสิกส์พื้นฐาน เคมีอินทรีย์"
          />
        </FormField>

        {/* Grade Level Dropdown */}
        <FormField 
          label="ระดับชั้น" 
          required 
          error={formState.errors.gradeLevel}
          description="เลือกระดับชั้นของผู้เรียนเพื่อปรับความยากง่ายของเนื้อหา"
        >
          <select
            id="gradeLevel"
            {...register('gradeLevel', studySheetValidationRules.gradeLevel)}
            disabled={formState.isSubmitting}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 transition-all duration-200 text-gray-900 bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gradeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        {/* Content Amount Selection */}
        <FormField 
          label="ปริมาณเนื้อหา" 
          required 
          error={formState.errors.contentAmount}
          description="เลือกปริมาณเนื้อหาที่ต้องการในชีทเรียน"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {contentAmountOptions.map((option) => (
              <label
                key={option.value}
                className={`relative cursor-pointer group ${formState.isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('contentAmount', studySheetValidationRules.contentAmount)}
                  disabled={formState.isSubmitting}
                  className="sr-only peer"
                />
                <div className="px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg text-center transition-all duration-200 peer-checked:border-login-learning-500 peer-checked:bg-login-learning-50 peer-checked:text-login-learning-700 hover:border-login-learning-300 hover:bg-gray-50 group-hover:shadow-sm">
                  <span className="font-medium text-sm">{option.label}</span>
                  {option.description && (
                    <p className="text-xs text-gray-500 mt-1 peer-checked:text-login-learning-600">
                      {option.description}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </FormField>

        {/* Exercise Amount Selection */}
        <FormField 
          label="ปริมาณแบบฝึกหัด" 
          required 
          error={formState.errors.exerciseAmount}
          description="เลือกจำนวนแบบฝึกหัดที่ต้องการในชีทเรียน"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {exerciseAmountOptions.map((option) => (
              <label
                key={option.value}
                className={`relative cursor-pointer group ${formState.isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('exerciseAmount', studySheetValidationRules.exerciseAmount)}
                  disabled={formState.isSubmitting}
                  className="sr-only peer"
                />
                <div className="px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg text-center transition-all duration-200 peer-checked:border-login-learning-500 peer-checked:bg-login-learning-50 peer-checked:text-login-learning-700 hover:border-login-learning-300 hover:bg-gray-50 group-hover:shadow-sm">
                  <span className="font-medium text-sm">{option.label}</span>
                  {option.description && (
                    <p className="text-xs text-gray-500 mt-1 peer-checked:text-login-learning-600">
                      {option.description}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </FormField>

        {/* AI Model Selector */}
        <div className="pt-6 border-t border-gray-200">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            gradeLevel={watchedValues.gradeLevel}
            contentAmount={watchedValues.contentAmount}
            className="mb-6"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={formState.isSubmitting || !formState.isValid || ai.isGenerating || !ai.serviceStatus.configured}
            className="w-full bg-gradient-to-r from-login-learning-600 to-login-learning-700 text-white py-4 px-6 rounded-lg font-medium text-lg hover:from-login-learning-700 hover:to-login-learning-800 focus:outline-none focus:ring-2 focus:ring-login-learning-500 focus:ring-offset-2 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98]"
          >
            {(formState.isSubmitting || ai.isGenerating) ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" color="white" className="mr-3" />
                กำลังสร้างชีทเรียน...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                สร้างชีทเรียน
              </div>
            )}
          </button>
          
          {/* Form Status Messages */}
          <div className="mt-4 text-center">
            {ai.isGenerating && (
              <p className="text-sm text-login-learning-600">
                AI กำลังสร้างชีทเรียน อาจใช้เวลา 1-2 นาที
              </p>
            )}
            {!ai.serviceStatus.configured && (
              <p className="text-sm text-red-600">
                กรุณาตั้งค่า OpenRouter API Key
              </p>
            )}
            {!formState.isValid && formState.isDirty && !ai.isGenerating && (
              <p className="text-sm text-red-600">
                กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง
              </p>
            )}
            {formState.isValid && !formState.isSubmitting && !ai.isGenerating && ai.serviceStatus.configured && (
              <p className="text-sm text-green-600">
                ข้อมูลถูกต้อง พร้อมสร้างชีทเรียนด้วย AI
              </p>
            )}
            {ai.serviceStatus.configured && (
              <p className="text-xs text-gray-500 mt-1">
                ใช้งาน AI โมเดล: {selectedModel || ai.serviceStatus.model}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            {/* Retry Button */}
            {(formState.globalError || ai.error) && !formState.isSubmitting && !ai.isGenerating && (
              <button
                type="button"
                onClick={() => {
                  formState.clearErrors();
                  ai.clearError();
                  if (ai.error) {
                    ai.retryGeneration();
                  }
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                ลองใหม่
              </button>
            )}

            {/* Clear Content Button */}
            {ai.content && !ai.isGenerating && (
              <button
                type="button"
                onClick={ai.clearContent}
                className="flex-1 bg-login-learning-100 text-login-learning-700 py-2 px-4 rounded-lg font-medium hover:bg-login-learning-200 focus:outline-none focus:ring-2 focus:ring-login-learning-500 focus:ring-offset-2 transition-colors duration-200"
              >
                สร้างใหม่
              </button>
            )}
          </div>
                </div>
                </form>
              </Card>
              
              {/* Branded Footer */}
              <BrandedFooter variant="minimal" />
            </div>

            {/* Realtime Preview Column - Desktop Only */}
            <div className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
              <RealtimePreview formData={watchedValues} />
            </div>
          </div>
        )}

        {/* Mobile Preview Toggle */}
        <MobilePreviewToggle formData={watchedValues} />
      </div>
    </div>
  );
}