'use client';

import React, { useState, useCallback } from 'react';
import { StudySheetContent, ContentSection, Exercise, Activity, ImageData, AnimationData } from '@/types';
import Card from '@/components/ui/Card';
import { ContentSectionEditor } from '@/components/editing/ContentSectionEditor';
import { ExerciseEditor } from '@/components/editing/ExerciseEditor';
import { ActivityEditor } from '@/components/editing/ActivityEditor';
import { ObjectivesEditor } from '@/components/editing/ObjectivesEditor';
import { SummaryEditor } from '@/components/editing/SummaryEditor';
import { TitleEditor } from '@/components/editing/TitleEditor';

interface StudySheetEditorProps {
  content: StudySheetContent;
  onContentChange: (updatedContent: StudySheetContent) => void;
  onSave?: () => void;
  onCancel?: () => void;
  isReadonly?: boolean;
}

type EditingMode = 'overview' | 'content' | 'exercises' | 'activities';

export default function StudySheetEditor({
  content: initialContent,
  onContentChange,
  onSave,
  onCancel,
  isReadonly = false
}: StudySheetEditorProps) {
  const [content, setContent] = useState<StudySheetContent>(initialContent);
  const [editingMode, setEditingMode] = useState<EditingMode>('overview');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update content and notify parent
  const updateContent = useCallback((updatedContent: StudySheetContent) => {
    setContent(updatedContent);
    setHasUnsavedChanges(true);
    onContentChange(updatedContent);
  }, [onContentChange]);

  // Title updates
  const handleTitleChange = useCallback((newTitle: string) => {
    updateContent({
      ...content,
      title: newTitle
    });
  }, [content, updateContent]);

  // Objectives updates
  const handleObjectivesChange = useCallback((newObjectives: string[]) => {
    updateContent({
      ...content,
      objectives: newObjectives
    });
  }, [content, updateContent]);

  // Content section updates
  const handleContentSectionAdd = useCallback(() => {
    const newSection: ContentSection = {
      id: `section_${Date.now()}`,
      title: 'หัวข้อใหม่',
      content: 'เนื้อหาในส่วนนี้...',
      type: 'theory',
      noteSpace: false,
      duration: 10,
      objectives: [],
      keyTerms: []
    };
    
    updateContent({
      ...content,
      mainContent: [...content.mainContent, newSection]
    });
  }, [content, updateContent]);

  const handleContentSectionUpdate = useCallback((index: number, updatedSection: ContentSection) => {
    const updatedMainContent = [...content.mainContent];
    updatedMainContent[index] = updatedSection;
    
    updateContent({
      ...content,
      mainContent: updatedMainContent
    });
  }, [content, updateContent]);

  const handleContentSectionDelete = useCallback((index: number) => {
    const updatedMainContent = content.mainContent.filter((_, i) => i !== index);
    
    updateContent({
      ...content,
      mainContent: updatedMainContent
    });
  }, [content, updateContent]);

  const handleContentSectionMove = useCallback((fromIndex: number, toIndex: number) => {
    const updatedMainContent = [...content.mainContent];
    const [movedSection] = updatedMainContent.splice(fromIndex, 1);
    updatedMainContent.splice(toIndex, 0, movedSection);
    
    updateContent({
      ...content,
      mainContent: updatedMainContent
    });
  }, [content, updateContent]);

  // Exercise updates
  const handleExerciseAdd = useCallback(() => {
    const newExercise: Exercise = {
      id: `exercise_${Date.now()}`,
      question: 'คำถามใหม่...',
      type: 'short-answer',
      answerSpace: 3,
      difficulty: 'medium',
      points: 1
    };
    
    updateContent({
      ...content,
      exercises: [...content.exercises, newExercise]
    });
  }, [content, updateContent]);

  const handleExerciseUpdate = useCallback((index: number, updatedExercise: Exercise) => {
    const updatedExercises = [...content.exercises];
    updatedExercises[index] = updatedExercise;
    
    updateContent({
      ...content,
      exercises: updatedExercises
    });
  }, [content, updateContent]);

  const handleExerciseDelete = useCallback((index: number) => {
    const updatedExercises = content.exercises.filter((_, i) => i !== index);
    
    updateContent({
      ...content,
      exercises: updatedExercises
    });
  }, [content, updateContent]);

  // Activity updates
  const handleActivityAdd = useCallback(() => {
    const newActivity: Activity = {
      id: `activity_${Date.now()}`,
      title: 'กิจกรรมใหม่',
      description: 'คำอธิบายกิจกรรม...',
      duration: 15,
      materials: ['กระดาษ', 'ปากกา'],
      type: 'individual',
      instructions: ['ขั้นตอนที่ 1'],
      expectedOutcome: 'ผลลัพธ์ที่คาดหวัง...'
    };
    
    updateContent({
      ...content,
      activities: [...content.activities, newActivity]
    });
  }, [content, updateContent]);

  const handleActivityUpdate = useCallback((index: number, updatedActivity: Activity) => {
    const updatedActivities = [...content.activities];
    updatedActivities[index] = updatedActivity;
    
    updateContent({
      ...content,
      activities: updatedActivities
    });
  }, [content, updateContent]);

  const handleActivityDelete = useCallback((index: number) => {
    const updatedActivities = content.activities.filter((_, i) => i !== index);
    
    updateContent({
      ...content,
      activities: updatedActivities
    });
  }, [content, updateContent]);

  // Summary updates
  const handleSummaryChange = useCallback((newSummary: string) => {
    updateContent({
      ...content,
      summary: newSummary
    });
  }, [content, updateContent]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave();
      setHasUnsavedChanges(false);
    }
  }, [onSave]);

  const renderEditingModeContent = () => {
    switch (editingMode) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Title Editor */}
            <Card>
              <TitleEditor
                title={content.title}
                onTitleChange={handleTitleChange}
                isReadonly={isReadonly}
              />
            </Card>

            {/* Objectives Editor */}
            <Card>
              <ObjectivesEditor
                objectives={content.objectives}
                onObjectivesChange={handleObjectivesChange}
                isReadonly={isReadonly}
              />
            </Card>

            {/* Summary Editor */}
            <Card>
              <SummaryEditor
                summary={content.summary}
                onSummaryChange={handleSummaryChange}
                isReadonly={isReadonly}
              />
            </Card>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-4">
            {content.mainContent.map((section, index) => (
              <Card key={section.id}>
                <ContentSectionEditor
                  section={section}
                  index={index}
                  onUpdate={(updatedSection) => handleContentSectionUpdate(index, updatedSection)}
                  onDelete={() => handleContentSectionDelete(index)}
                  onMoveUp={index > 0 ? () => handleContentSectionMove(index, index - 1) : undefined}
                  onMoveDown={index < content.mainContent.length - 1 ? () => handleContentSectionMove(index, index + 1) : undefined}
                  isReadonly={isReadonly}
                />
              </Card>
            ))}
            
            {!isReadonly && (
              <Card className="border-2 border-dashed border-login-learning-300 bg-login-learning-50">
                <button
                  onClick={handleContentSectionAdd}
                  className="w-full p-6 text-login-learning-600 hover:text-login-learning-800 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium">เพิ่มหัวข้อใหม่</span>
                </button>
              </Card>
            )}
          </div>
        );

      case 'exercises':
        return (
          <div className="space-y-4">
            {content.exercises.map((exercise, index) => (
              <Card key={exercise.id}>
                <ExerciseEditor
                  exercise={exercise}
                  index={index}
                  onUpdate={(updatedExercise) => handleExerciseUpdate(index, updatedExercise)}
                  onDelete={() => handleExerciseDelete(index)}
                  isReadonly={isReadonly}
                />
              </Card>
            ))}
            
            {!isReadonly && (
              <Card className="border-2 border-dashed border-login-learning-300 bg-login-learning-50">
                <button
                  onClick={handleExerciseAdd}
                  className="w-full p-6 text-login-learning-600 hover:text-login-learning-800 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium">เพิ่มแบบฝึกหัดใหม่</span>
                </button>
              </Card>
            )}
          </div>
        );

      case 'activities':
        return (
          <div className="space-y-4">
            {content.activities.map((activity, index) => (
              <Card key={activity.id}>
                <ActivityEditor
                  activity={activity}
                  index={index}
                  onUpdate={(updatedActivity) => handleActivityUpdate(index, updatedActivity)}
                  onDelete={() => handleActivityDelete(index)}
                  isReadonly={isReadonly}
                />
              </Card>
            ))}
            
            {!isReadonly && (
              <Card className="border-2 border-dashed border-login-learning-300 bg-login-learning-50">
                <button
                  onClick={handleActivityAdd}
                  className="w-full p-6 text-login-learning-600 hover:text-login-learning-800 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="font-medium">เพิ่มกิจกรรมใหม่</span>
                </button>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Editor Header */}
      <Card className="mb-6 bg-gradient-to-r from-login-learning-50 to-login-learning-100 border-login-learning-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-login-learning-800">
              {isReadonly ? 'ดู' : 'แก้ไข'}แผ่นงานการเรียนรู้
            </h2>
            <p className="text-sm text-login-learning-600 mt-1">
              {isReadonly ? 'โหมดดูอย่างเดียว' : 'คลิกเพื่อแก้ไขเนื้อหาในแต่ละส่วน'}
            </p>
          </div>
          
          {!isReadonly && (
            <div className="flex space-x-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  hasUnsavedChanges
                    ? 'bg-login-learning-600 text-white hover:bg-login-learning-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                บันทึก
              </button>
            </div>
          )}
        </div>

        {hasUnsavedChanges && !isReadonly && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm text-yellow-800">มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก</span>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation Tabs */}
      <Card className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: 'overview', label: 'ภาพรวม', icon: '📋' },
            { key: 'content', label: 'เนื้อหาหลัก', icon: '📚' },
            { key: 'exercises', label: 'แบบฝึกหัด', icon: '📝' },
            { key: 'activities', label: 'กิจกรรม', icon: '🎯' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setEditingMode(tab.key as EditingMode)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                editingMode === tab.key
                  ? 'bg-white text-login-learning-800 shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Content Statistics */}
      <Card className="mb-6 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-login-learning-600">{content.objectives.length}</div>
            <div className="text-sm text-gray-600">วัตถุประสงค์</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-login-learning-600">{content.mainContent.length}</div>
            <div className="text-sm text-gray-600">หัวข้อเนื้อหา</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-login-learning-600">{content.exercises.length}</div>
            <div className="text-sm text-gray-600">แบบฝึกหัด</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-login-learning-600">{content.activities.length}</div>
            <div className="text-sm text-gray-600">กิจกรรม</div>
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      <div className="mb-6">
        {renderEditingModeContent()}
      </div>
    </div>
  );
}