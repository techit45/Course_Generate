import { StudySheetContent } from '@/types';
import Card from '@/components/ui/Card';
import { ImageDisplay, ImageGallery } from '@/components/ui/ImageDisplay';
import { DiagramDisplay, DiagramGallery } from '@/components/ui/DiagramDisplay';
import StudySheetEditor from '@/components/StudySheetEditor';
import ExportOptionsModal from '@/components/export/ExportOptionsModal';
import ExportProgressModal from '@/components/export/ExportProgressModal';
import LoginLearningLogo from '@/components/branding/LoginLearningLogo';
import { useExport } from '@/hooks/useExport';
import { useState, useRef } from 'react';

interface StudySheetPreviewProps {
  content: StudySheetContent;
  onEdit?: () => void;
  onExport?: (format: 'pdf' | 'web' | 'json') => void;
  onContentChange?: (updatedContent: StudySheetContent) => void;
  enableEditing?: boolean;
}

export default function StudySheetPreview({ 
  content, 
  onEdit, 
  onExport,
  onContentChange,
  enableEditing = true
}: StudySheetPreviewProps) {
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingContent, setEditingContent] = useState(content);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Use the export hook
  const {
    isExporting,
    exportProgress,
    exportResult,
    error: exportError,
    exportToPDF,
    exportToWeb,
    exportToJSON,
    downloadResult,
    copyShareUrl,
    clearResult,
    clearError
  } = useExport();

  const handleExportClick = () => {
    setShowExportOptions(true);
  };

  const handleExport = async (format: 'pdf' | 'web' | 'json', options: any) => {
    setShowExportOptions(false);
    setShowProgressModal(true);

    if (!contentRef.current && format === 'pdf') {
      console.error('Content ref not available for PDF export');
      return;
    }

    try {
      switch (format) {
        case 'pdf':
          await exportToPDF(content, contentRef.current!, options);
          break;
        case 'web':
          await exportToWeb(content);
          break;
        case 'json':
          await exportToJSON(content);
          break;
      }

      // Call onExport callback if provided
      if (onExport) {
        onExport(format);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleProgressModalClose = () => {
    setShowProgressModal(false);
    clearResult();
  };

  const handleRetryExport = () => {
    clearError();
    handleExportClick();
  };


  const handleEditModeToggle = () => {
    if (isEditMode && onContentChange) {
      // Save changes when exiting edit mode
      onContentChange(editingContent);
    }
    setIsEditMode(!isEditMode);
  };

  const handleContentUpdate = (updatedContent: StudySheetContent) => {
    setEditingContent(updatedContent);
  };

  const handleEditSave = () => {
    if (onContentChange) {
      onContentChange(editingContent);
    }
    setIsEditMode(false);
  };

  const handleEditCancel = () => {
    setEditingContent(content); // Reset to original content
    setIsEditMode(false);
  };

  // If in edit mode, show the editor
  if (isEditMode) {
    return (
      <StudySheetEditor
        content={editingContent}
        onContentChange={handleContentUpdate}
        onSave={handleEditSave}
        onCancel={handleEditCancel}
        isReadonly={false}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6" ref={contentRef}>
      {/* Branded Header with Logo */}
      <Card className="bg-gradient-to-r from-login-learning-600 to-blue-600 text-white border-0 shadow-xl">
        {/* Login-Learning Branding */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/20">
          <LoginLearningLogo 
            variant="full"
            size="md"
            color="white"
          />
          <div className="text-right">
            <div className="text-xs text-login-learning-100 font-medium">
              STUDY SHEET GENERATOR
            </div>
            <div className="text-xs text-login-learning-200 mt-1">
              Powered by AI Technology
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white break-words">
              {content.title}
            </h2>
            {content.metadata && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-login-learning-100">
                <span className="flex-shrink-0">📄 {content.metadata.pageCount} หน้า</span>
                <span className="flex-shrink-0">⏱️ {Math.floor(content.metadata.totalDuration / 60)} ชั่วโมง {content.metadata.totalDuration % 60} นาที</span>
                <span className="flex-shrink-0">📚 {content.metadata.sectionCount} หัวข้อ</span>
                <span className="flex-shrink-0">📝 {content.metadata.exerciseCount} แบบฝึกหัด</span>
                <span className="flex-shrink-0">🎯 {content.metadata.activityCount} กิจกรรม</span>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 flex-shrink-0">
            {enableEditing && (
              <button
                onClick={handleEditModeToggle}
                className="px-3 py-2 sm:px-4 bg-white/20 text-white border border-white/30 rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center justify-center backdrop-blur-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-sm sm:text-base font-medium">แก้ไข</span>
              </button>
            )}
            {/* Export Button */}
            <button
              onClick={handleExportClick}
              disabled={isExporting}
              className="px-3 py-2 sm:px-4 bg-white text-login-learning-600 rounded-lg hover:bg-login-learning-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center font-medium shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm sm:text-base">{isExporting ? 'กำลังส่งออก...' : 'ส่งออก'}</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Objectives */}
      <Card>
        <h3 className="text-xl font-bold text-login-learning-800 mb-4 flex items-center">
          <span className="inline-block w-8 h-8 bg-login-learning-100 rounded-full flex items-center justify-center mr-3">
            🎯
          </span>
          วัตถุประสงค์การเรียนรู้
        </h3>
        <ul className="space-y-2">
          {content.objectives.map((objective, index) => (
            <li key={index} className="flex items-start">
              <span className="inline-block w-6 h-6 bg-login-learning-500 text-white rounded-full text-xs flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                {index + 1}
              </span>
              <span className="text-gray-700">{objective}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Main Content */}
      <Card>
        <h3 className="text-xl font-bold text-login-learning-800 mb-4 flex items-center">
          <span className="inline-block w-8 h-8 bg-login-learning-100 rounded-full flex items-center justify-center mr-3">
            📚
          </span>
          เนื้อหาหลัก
        </h3>
        <div className="space-y-4">
          {content.mainContent.map((section, index) => (
            <div key={section.id} className="border-l-4 border-login-learning-300 pl-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-800">
                  {index + 1}. {section.title}
                </h4>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {section.type === 'theory' ? 'ทฤษฎี' :
                     section.type === 'example' ? 'ตัวอย่าง' :
                     section.type === 'explanation' ? 'อธิบาย' :
                     section.type === 'practice' ? 'ฝึกปฏิบัติ' : 'สรุป'}
                  </span>
                  {section.duration && (
                    <span className="text-xs">⏱️ {section.duration} นาที</span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-2 leading-relaxed">
                {section.content}
              </p>

              {/* Section Images */}
              {section.images && section.images.length > 0 && (
                <div className="my-4">
                  <ImageGallery 
                    images={section.images} 
                    maxColumns={2}
                    showCaptions={true}
                    interactive={true}
                  />
                </div>
              )}

              {/* Section Diagrams */}
              {section.animations && section.animations.length > 0 && (
                <div className="my-4">
                  <DiagramGallery 
                    diagrams={section.animations}
                    showTitles={false}
                    showInstructions={true}
                    interactive={true}
                  />
                </div>
              )}

              {section.noteSpace && (
                <div className="mt-3 p-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded">
                  <p className="text-sm text-gray-500 italic">
                    💭 พื้นที่สำหรับจดโน้ต...
                  </p>
                </div>
              )}
              {section.keyTerms && section.keyTerms.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">คำศัพท์สำคัญ:</p>
                  <div className="flex flex-wrap gap-1">
                    {section.keyTerms.map((term, i) => (
                      <span key={i} className="px-2 py-1 bg-login-learning-100 text-login-learning-700 rounded text-xs">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Activities */}
      {content.activities.length > 0 && (
        <Card>
          <h3 className="text-xl font-bold text-login-learning-800 mb-4 flex items-center">
            <span className="inline-block w-8 h-8 bg-login-learning-100 rounded-full flex items-center justify-center mr-3">
              🎪
            </span>
            กิจกรรมการเรียนรู้
          </h3>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {content.activities.map((activity, index) => (
              <div key={activity.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-1 sm:space-y-0">
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                    กิจกรรมที่ {index + 1}: {activity.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 flex-shrink-0">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {activity.type === 'individual' ? 'รายบุคคล' :
                       activity.type === 'group' ? 'กลุ่ม' :
                       activity.type === 'demonstration' ? 'สาธิต' : 'อภิปราย'}
                    </span>
                    <span className="text-xs">⏱️ {activity.duration} นาที</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{activity.description}</p>
                
                {activity.instructions && activity.instructions.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">ขั้นตอน:</p>
                    <ol className="text-sm text-gray-600 space-y-1">
                      {activity.instructions.map((instruction, i) => (
                        <li key={i} className="flex items-start">
                          <span className="inline-block w-4 h-4 bg-gray-200 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                            {i + 1}
                          </span>
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div>
                    <span className="font-medium">วัสดุ:</span> {activity.materials.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Exercises */}
      {content.exercises.length > 0 && (
        <Card>
          <h3 className="text-xl font-bold text-login-learning-800 mb-4 flex items-center">
            <span className="inline-block w-8 h-8 bg-login-learning-100 rounded-full flex items-center justify-center mr-3">
              📝
            </span>
            แบบฝึกหัด ({content.exercises.length} ข้อ)
          </h3>
          <div className="space-y-4">
            {content.exercises.map((exercise, index) => (
              <div key={exercise.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">
                    ข้อ {index + 1}.
                  </span>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      exercise.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      exercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {exercise.difficulty === 'easy' ? 'ง่าย' :
                       exercise.difficulty === 'medium' ? 'ปานกลาง' : 'ยาก'}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {exercise.type === 'multiple-choice' ? 'ปรนัย' :
                       exercise.type === 'short-answer' ? 'อัตนัย' :
                       exercise.type === 'essay' ? 'เรียงความ' :
                       exercise.type === 'true-false' ? 'ถูก/ผิด' :
                       exercise.type === 'matching' ? 'จับคู่' : 'เติมคำ'}
                    </span>
                    {exercise.points && (
                      <span className="text-xs text-gray-500">{exercise.points} คะแนน</span>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{exercise.question}</p>
                
                {exercise.options && exercise.options.length > 0 && (
                  <div className="mb-3">
                    {exercise.options.map((option, i) => (
                      <div key={i} className="flex items-center mb-1">
                        <span className="w-6 h-6 bg-gray-100 rounded-full text-xs flex items-center justify-center mr-2">
                          {String.fromCharCode(97 + i)}
                        </span>
                        <span className="text-gray-600">{option}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded p-3">
                    <p className="text-sm text-gray-500 italic">
                      ✏️ พื้นที่สำหรับตอบ ({exercise.answerSpace} บรรทัด)...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Summary */}
      <Card>
        <h3 className="text-xl font-bold text-login-learning-800 mb-4 flex items-center">
          <span className="inline-block w-8 h-8 bg-login-learning-100 rounded-full flex items-center justify-center mr-3">
            📋
          </span>
          สรุปบทเรียน
        </h3>
        <div className="bg-gradient-to-r from-login-learning-50 to-login-learning-100 border border-login-learning-200 rounded-lg p-4">
          <p className="text-gray-700 leading-relaxed">{content.summary}</p>
        </div>
      </Card>

      {/* Images */}
      {content.images.length > 0 && (
        <Card>
          <h3 className="text-xl font-bold text-login-learning-800 mb-4 flex items-center">
            <span className="inline-block w-8 h-8 bg-login-learning-100 rounded-full flex items-center justify-center mr-3">
              🖼️
            </span>
            ภาพประกอบที่แนะนำ
          </h3>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.images.map((image, index) => (
              <div key={image.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="bg-gray-100 rounded-lg h-24 sm:h-32 flex items-center justify-center mb-2 sm:mb-3">
                  <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-800 mb-1">
                  ภาพที่ {index + 1}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">{image.description}</p>
                <div className="flex flex-wrap gap-1">
                  {image.keywords.map((keyword, i) => (
                    <span key={i} className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Export Options Modal */}
      <ExportOptionsModal
        isOpen={showExportOptions}
        onClose={() => setShowExportOptions(false)}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Export Progress Modal */}
      <ExportProgressModal
        isOpen={showProgressModal}
        progress={exportProgress}
        result={exportResult}
        error={exportError}
        onClose={handleProgressModalClose}
        onDownload={downloadResult}
        onCopyShareUrl={copyShareUrl}
        onRetry={handleRetryExport}
      />
    </div>
  );
}