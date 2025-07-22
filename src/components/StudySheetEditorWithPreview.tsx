'use client';

import React, { useState, useEffect } from 'react';
import { StudySheetContent } from '@/types';
import StudySheetEditor from '@/components/StudySheetEditor';
import StudySheetPreview from '@/components/StudySheetPreview';

interface StudySheetEditorWithPreviewProps {
  content: StudySheetContent;
  onContentChange: (updatedContent: StudySheetContent) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

type ViewMode = 'split' | 'editor' | 'preview';

export default function StudySheetEditorWithPreview({
  content: initialContent,
  onContentChange,
  onSave,
  onCancel
}: StudySheetEditorWithPreviewProps) {
  const [content, setContent] = useState<StudySheetContent>(initialContent);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  // Auto-save changes after 2 seconds of inactivity
  useEffect(() => {
    if (!autoSave || !hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      onContentChange(content);
      setHasUnsavedChanges(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, hasUnsavedChanges, autoSave, onContentChange]);

  const handleContentUpdate = (updatedContent: StudySheetContent) => {
    setContent(updatedContent);
    setHasUnsavedChanges(true);
    
    // Immediate update for preview if not auto-saving
    if (!autoSave) {
      onContentChange(updatedContent);
    }
  };

  const handleSave = () => {
    onContentChange(content);
    setHasUnsavedChanges(false);
    if (onSave) {
      onSave();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const getViewModeClasses = () => {
    switch (viewMode) {
      case 'split':
        return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
      case 'editor':
        return 'grid grid-cols-1';
      case 'preview':
        return 'grid grid-cols-1';
      default:
        return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                แก้ไขแผ่นงานการเรียนรู้
              </h1>
              
              {hasUnsavedChanges && (
                <div className="flex items-center text-sm text-amber-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('editor')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    viewMode === 'editor'
                      ? 'bg-white text-login-learning-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    viewMode === 'split'
                      ? 'bg-white text-login-learning-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  แบ่งหน้าจอ
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-white text-login-learning-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  ดูตัวอย่าง
                </button>
              </div>

              {/* Auto-save Toggle */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-login-learning-500 focus:ring-offset-2 ${
                    autoSave ? 'bg-login-learning-600' : 'bg-gray-200'
                  }`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      autoSave ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                  <span className="ml-2 text-sm text-gray-700">บันทึกอัตโนมัติ</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges && autoSave}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    hasUnsavedChanges || !autoSave
                      ? 'bg-login-learning-600 text-white hover:bg-login-learning-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={getViewModeClasses()}>
          {/* Editor Panel */}
          {(viewMode === 'editor' || viewMode === 'split') && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-login-learning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  แก้ไขเนื้อหา
                </h2>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <StudySheetEditor
                  content={content}
                  onContentChange={handleContentUpdate}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isReadonly={false}
                />
              </div>
            </div>
          )}

          {/* Preview Panel */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  ตัวอย่างแผ่นงาน
                  {hasUnsavedChanges && autoSave && (
                    <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                      อัปเดตแบบเรียลไทม์
                    </span>
                  )}
                </h2>
              </div>
              <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <StudySheetPreview
                  content={content}
                  enableEditing={false}
                  onContentChange={handleContentUpdate}
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">
                เคล็ดลับการใช้งาน
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>ใช้โหมด "แบ่งหน้าจอ" เพื่อดูการเปลี่ยนแปลงแบบเรียลไทม์</li>
                  <li>เปิด "บันทึกอัตโนมัติ" เพื่อป้องกันการสูญหายของข้อมูล</li>
                  <li>คลิกที่หัวข้อเพื่อขยายและแก้ไขรายละเอียด</li>
                  <li>ใช้ปุ่มลูกศรเพื่อเรียงลำดับหัวข้อใหม่</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}