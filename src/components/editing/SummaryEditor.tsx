'use client';

import React, { useState } from 'react';

interface SummaryEditorProps {
  summary: string;
  onSummaryChange: (newSummary: string) => void;
  isReadonly?: boolean;
}

export const SummaryEditor: React.FC<SummaryEditorProps> = ({
  summary,
  onSummaryChange,
  isReadonly = false
}) => {
  const [charCount, setCharCount] = useState(summary.length);

  const handleSummaryChange = (value: string) => {
    onSummaryChange(value);
    setCharCount(value.length);
  };

  const getCharCountColor = () => {
    if (charCount < 100) return 'text-red-500';
    if (charCount < 200) return 'text-yellow-500';
    if (charCount > 500) return 'text-red-500';
    return 'text-green-500';
  };

  const getSuggestionText = () => {
    if (charCount < 100) return 'สรุปควรมีความยาวอย่างน้อย 100 ตัวอักษร';
    if (charCount > 500) return 'สรุปไม่ควรยาวเกิน 500 ตัวอักษร';
    return 'ความยาวของสรุปเหมาะสม';
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-login-learning-800 mb-4 flex items-center">
        <span className="inline-block w-8 h-8 bg-login-learning-100 rounded-full flex items-center justify-center mr-3">
          📋
        </span>
        สรุปบทเรียน
      </h3>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="summary-textarea" className="block text-sm font-medium text-gray-700">
            เนื้อหาสรุป
          </label>
          <span className={`text-sm ${getCharCountColor()}`}>
            {charCount} ตัวอักษร
          </span>
        </div>
        
        <textarea
          id="summary-textarea"
          value={summary}
          onChange={(e) => handleSummaryChange(e.target.value)}
          disabled={isReadonly}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
          placeholder="เขียนสรุปบทเรียนที่ครอบคลุมจุดสำคัญทั้งหมด..."
        />
        
        <div className="mt-2 flex items-center justify-between">
          <span className={`text-sm ${getCharCountColor()}`}>
            {getSuggestionText()}
          </span>
          <span className="text-sm text-gray-500">
            แนะนำ: 200-400 ตัวอักษร
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-green-900">
              คำแนะนำในการเขียนสรุป
            </h4>
            <div className="mt-1 text-sm text-green-700">
              <ul className="list-disc list-inside space-y-1">
                <li>ทบทวนจุดสำคัญทั้งหมดที่ได้เรียนรู้</li>
                <li>เชื่อมโยงความรู้เข้ากับวัตถุประสงค์การเรียนรู้</li>
                <li>ใช้ภาษาที่เข้าใจง่ายและกระชับ</li>
                <li>เน้นสิ่งที่ผู้เรียนควรจดจำ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};