'use client';

import React, { useState } from 'react';
import { Exercise } from '@/types';

interface ExerciseEditorProps {
  exercise: Exercise;
  index: number;
  onUpdate: (updatedExercise: Exercise) => void;
  onDelete: () => void;
  isReadonly?: boolean;
}

export const ExerciseEditor: React.FC<ExerciseEditorProps> = ({
  exercise,
  index,
  onUpdate,
  onDelete,
  isReadonly = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdate = (field: keyof Exercise, value: any) => {
    onUpdate({
      ...exercise,
      [field]: value
    });
  };

  const handleOptionAdd = () => {
    const currentOptions = exercise.options || [];
    handleUpdate('options', [...currentOptions, 'ตัวเลือกใหม่']);
  };

  const handleOptionUpdate = (optionIndex: number, value: string) => {
    const currentOptions = [...(exercise.options || [])];
    currentOptions[optionIndex] = value;
    handleUpdate('options', currentOptions);
  };

  const handleOptionRemove = (optionIndex: number) => {
    const currentOptions = (exercise.options || []).filter((_, i) => i !== optionIndex);
    handleUpdate('options', currentOptions);
  };

  const getDifficultyColor = (difficulty: Exercise['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: Exercise['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'ง่าย';
      case 'medium': return 'ปานกลาง';
      case 'hard': return 'ยาก';
      default: return difficulty;
    }
  };

  const getTypeText = (type: Exercise['type']) => {
    const typeMap = {
      'multiple-choice': 'ปรนัย',
      'short-answer': 'อัตนัย',
      'essay': 'เรียงความ',
      'true-false': 'ถูก/ผิด',
      'matching': 'จับคู่',
      'fill-blank': 'เติมคำ'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* Exercise Header */}
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
              <span className="text-sm font-medium text-gray-500">ข้อ {index + 1}</span>
              <span className="px-2 py-1 bg-login-learning-100 text-login-learning-700 rounded text-xs">
                {getTypeText(exercise.type)}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                {getDifficultyText(exercise.difficulty)}
              </span>
              {exercise.points && (
                <span className="text-xs text-gray-500">{exercise.points} คะแนน</span>
              )}
            </div>
            <p className="text-sm text-gray-700 truncate max-w-md">
              {exercise.question}
            </p>
          </div>
        </div>

        {!isReadonly && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="ลบแบบฝึกหัด"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คำถาม
            </label>
            <textarea
              value={exercise.question}
              onChange={(e) => handleUpdate('question', e.target.value)}
              disabled={isReadonly}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="เขียนคำถาม..."
            />
          </div>

          {/* Type, Difficulty, Points */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประเภทคำถาม
              </label>
              <select
                value={exercise.type}
                onChange={(e) => handleUpdate('type', e.target.value as Exercise['type'])}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="multiple-choice">ปรนัย</option>
                <option value="short-answer">อัตนัย</option>
                <option value="essay">เรียงความ</option>
                <option value="true-false">ถูก/ผิด</option>
                <option value="matching">จับคู่</option>
                <option value="fill-blank">เติมคำ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ระดับความยาก
              </label>
              <select
                value={exercise.difficulty}
                onChange={(e) => handleUpdate('difficulty', e.target.value as Exercise['difficulty'])}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="easy">ง่าย</option>
                <option value="medium">ปานกลาง</option>
                <option value="hard">ยาก</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                คะแนน
              </label>
              <input
                type="number"
                value={exercise.points || 1}
                onChange={(e) => handleUpdate('points', parseInt(e.target.value) || 1)}
                disabled={isReadonly}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          {/* Answer Space */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              จำนวนบรรทัดสำหรับตอบ
            </label>
            <input
              type="number"
              value={exercise.answerSpace}
              onChange={(e) => handleUpdate('answerSpace', parseInt(e.target.value) || 1)}
              disabled={isReadonly}
              min="1"
              max="20"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Options for Multiple Choice */}
          {exercise.type === 'multiple-choice' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  ตัวเลือก
                </label>
                {!isReadonly && (
                  <button
                    onClick={handleOptionAdd}
                    className="text-sm text-login-learning-600 hover:text-login-learning-800"
                  >
                    + เพิ่มตัวเลือก
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {(exercise.options || []).map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-gray-100 rounded-full text-xs flex items-center justify-center flex-shrink-0">
                      {String.fromCharCode(97 + optionIndex)}
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionUpdate(optionIndex, e.target.value)}
                      disabled={isReadonly}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder={`ตัวเลือก ${String.fromCharCode(97 + optionIndex)}`}
                    />
                    {!isReadonly && (exercise.options || []).length > 2 && (
                      <button
                        onClick={() => handleOptionRemove(optionIndex)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
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
          )}

          {/* True/False Options */}
          {exercise.type === 'true-false' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                คำตอบที่ถูกต้อง
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`answer_${exercise.id}`}
                    value="true"
                    checked={exercise.correctAnswer === 'true'}
                    onChange={(e) => handleUpdate('correctAnswer', e.target.value)}
                    disabled={isReadonly}
                    className="mr-2"
                  />
                  ถูก
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`answer_${exercise.id}`}
                    value="false"
                    checked={exercise.correctAnswer === 'false'}
                    onChange={(e) => handleUpdate('correctAnswer', e.target.value)}
                    disabled={isReadonly}
                    className="mr-2"
                  />
                  ผิด
                </label>
              </div>
            </div>
          )}

          {/* Correct Answer */}
          {exercise.type !== 'true-false' && exercise.type !== 'essay' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                คำตอบที่ถูกต้อง (สำหรับตรวจ)
              </label>
              <input
                type="text"
                value={typeof exercise.correctAnswer === 'string' ? exercise.correctAnswer : ''}
                onChange={(e) => handleUpdate('correctAnswer', e.target.value)}
                disabled={isReadonly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="ระบุคำตอบที่ถูกต้อง..."
              />
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คำอธิบายเฉลย (ไม่บังคับ)
            </label>
            <textarea
              value={exercise.explanation || ''}
              onChange={(e) => handleUpdate('explanation', e.target.value)}
              disabled={isReadonly}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="อธิบายเหตุผลของคำตอบที่ถูกต้อง..."
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ยืนยันการลบแบบฝึกหัด
            </h3>
            <p className="text-gray-600 mb-6">
              คุณต้องการลบแบบฝึกหัดข้อ {index + 1} หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้
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