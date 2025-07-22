'use client';

import React, { useState } from 'react';
import { ContentSection, ImageData, AnimationData } from '@/types';

interface ContentSectionEditorProps {
  section: ContentSection;
  index: number;
  onUpdate: (updatedSection: ContentSection) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isReadonly?: boolean;
}

export const ContentSectionEditor: React.FC<ContentSectionEditorProps> = ({
  section,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isReadonly = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdate = (field: keyof ContentSection, value: any) => {
    onUpdate({
      ...section,
      [field]: value
    });
  };

  const handleKeyTermAdd = () => {
    const newTerm = prompt('เพิ่มคำศัพท์สำคัญ:');
    if (newTerm && newTerm.trim()) {
      handleUpdate('keyTerms', [...(section.keyTerms || []), newTerm.trim()]);
    }
  };

  const handleKeyTermRemove = (termIndex: number) => {
    const updatedTerms = (section.keyTerms || []).filter((_, i) => i !== termIndex);
    handleUpdate('keyTerms', updatedTerms);
  };

  const handleObjectiveAdd = () => {
    const newObjective = prompt('เพิ่มจุดประสงค์เฉพาะ:');
    if (newObjective && newObjective.trim()) {
      handleUpdate('objectives', [...(section.objectives || []), newObjective.trim()]);
    }
  };

  const handleObjectiveRemove = (objIndex: number) => {
    const updatedObjectives = (section.objectives || []).filter((_, i) => i !== objIndex);
    handleUpdate('objectives', updatedObjectives);
  };

  const getSectionTypeText = (type: ContentSection['type']) => {
    const typeMap = {
      'theory': 'ทฤษฎี',
      'example': 'ตัวอย่าง',
      'explanation': 'อธิบาย',
      'practice': 'ฝึกปฏิบัติ',
      'summary': 'สรุป'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* Section Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <svg 
              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500">หัวข้อที่ {index + 1}</span>
              <span className="px-2 py-1 bg-login-learning-100 text-login-learning-700 rounded text-xs">
                {getSectionTypeText(section.type)}
              </span>
              {section.duration && (
                <span className="text-xs text-gray-500">⏱️ {section.duration} นาที</span>
              )}
            </div>
            <h3 className="font-medium text-gray-900">{section.title}</h3>
          </div>
        </div>

        {!isReadonly && (
          <div className="flex items-center space-x-1">
            {/* Move buttons */}
            {onMoveUp && (
              <button
                onClick={onMoveUp}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                title="ย้ายขึ้น"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            )}
            
            {onMoveDown && (
              <button
                onClick={onMoveDown}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                title="ย้ายลง"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}

            {/* Delete button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="ลบหัวข้อ"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อหัวข้อ
            </label>
            <input
              type="text"
              value={section.title}
              onChange={(e) => handleUpdate('title', e.target.value)}
              disabled={isReadonly}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Type and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประเภทเนื้อหา
              </label>
              <select
                value={section.type}
                onChange={(e) => handleUpdate('type', e.target.value as ContentSection['type'])}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="theory">ทฤษฎี</option>
                <option value="example">ตัวอย่าง</option>
                <option value="explanation">อธิบาย</option>
                <option value="practice">ฝึกปฏิบัติ</option>
                <option value="summary">สรุป</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ระยะเวลา (นาที)
              </label>
              <input
                type="number"
                value={section.duration || 0}
                onChange={(e) => handleUpdate('duration', parseInt(e.target.value) || 0)}
                disabled={isReadonly}
                min="0"
                max="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              เนื้อหา
            </label>
            <textarea
              value={section.content}
              onChange={(e) => handleUpdate('content', e.target.value)}
              disabled={isReadonly}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="เขียนเนื้อหาในส่วนนี้..."
            />
          </div>

          {/* Key Terms */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                คำศัพท์สำคัญ
              </label>
              {!isReadonly && (
                <button
                  onClick={handleKeyTermAdd}
                  className="text-sm text-login-learning-600 hover:text-login-learning-800"
                >
                  + เพิ่มคำศัพท์
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(section.keyTerms || []).map((term, termIndex) => (
                <div key={termIndex} className="flex items-center bg-login-learning-100 text-login-learning-800 px-2 py-1 rounded text-sm">
                  <span>{term}</span>
                  {!isReadonly && (
                    <button
                      onClick={() => handleKeyTermRemove(termIndex)}
                      className="ml-2 text-login-learning-600 hover:text-login-learning-800"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Specific Objectives */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                จุดประสงค์เฉพาะส่วน
              </label>
              {!isReadonly && (
                <button
                  onClick={handleObjectiveAdd}
                  className="text-sm text-login-learning-600 hover:text-login-learning-800"
                >
                  + เพิ่มจุดประสงค์
                </button>
              )}
            </div>
            <div className="space-y-1">
              {(section.objectives || []).map((objective, objIndex) => (
                <div key={objIndex} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                  <span className="text-sm">{objective}</span>
                  {!isReadonly && (
                    <button
                      onClick={() => handleObjectiveRemove(objIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Note Space Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`noteSpace_${section.id}`}
              checked={section.noteSpace}
              onChange={(e) => handleUpdate('noteSpace', e.target.checked)}
              disabled={isReadonly}
              className="h-4 w-4 text-login-learning-600 focus:ring-login-learning-500 border-gray-300 rounded disabled:opacity-50"
            />
            <label htmlFor={`noteSpace_${section.id}`} className="ml-2 text-sm text-gray-700">
              เพิ่มพื้นที่สำหรับจดโน้ต
            </label>
          </div>

          {/* Images and Animations placeholders */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ภาพประกอบ ({(section.images || []).length})
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 text-sm">
                ระบบจัดการภาพประกอบ
                <br />
                (ยังไม่เปิดใช้งาน)
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                แผนภาพ/ภาพเคลื่อนไหว ({(section.animations || []).length})
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 text-sm">
                ระบบจัดการแผนภาพ
                <br />
                (ยังไม่เปิดใช้งาน)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ยืนยันการลบหัวข้อ
            </h3>
            <p className="text-gray-600 mb-6">
              คุณต้องการลบหัวข้อ "{section.title}" หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};