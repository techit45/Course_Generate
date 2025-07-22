'use client';

import React, { useState } from 'react';

interface ObjectivesEditorProps {
  objectives: string[];
  onObjectivesChange: (newObjectives: string[]) => void;
  isReadonly?: boolean;
}

export const ObjectivesEditor: React.FC<ObjectivesEditorProps> = ({
  objectives,
  onObjectivesChange,
  isReadonly = false
}) => {
  const [newObjective, setNewObjective] = useState('');

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      onObjectivesChange([...objectives, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const handleUpdateObjective = (index: number, value: string) => {
    const updatedObjectives = [...objectives];
    updatedObjectives[index] = value;
    onObjectivesChange(updatedObjectives);
  };

  const handleRemoveObjective = (index: number) => {
    const updatedObjectives = objectives.filter((_, i) => i !== index);
    onObjectivesChange(updatedObjectives);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddObjective();
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-login-learning-800 mb-4 flex items-center">
        <span className="inline-block w-8 h-8 bg-login-learning-100 rounded-full flex items-center justify-center mr-3">
          🎯
        </span>
        วัตถุประสงค์การเรียนรู้
      </h3>

      <div className="space-y-3">
        {objectives.map((objective, index) => (
          <div key={index} className="flex items-start space-x-3">
            <span className="inline-block w-6 h-6 bg-login-learning-500 text-white rounded-full text-xs flex items-center justify-center mt-1 flex-shrink-0">
              {index + 1}
            </span>
            <div className="flex-1">
              <textarea
                value={objective}
                onChange={(e) => handleUpdateObjective(index, e.target.value)}
                disabled={isReadonly}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                placeholder={`วัตถุประสงค์ที่ ${index + 1}...`}
              />
            </div>
            {!isReadonly && objectives.length > 1 && (
              <button
                onClick={() => handleRemoveObjective(index)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded mt-1"
                title="ลบวัตถุประสงค์"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}

        {!isReadonly && (
          <div className="border-2 border-dashed border-login-learning-300 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="inline-block w-6 h-6 bg-gray-300 text-white rounded-full text-xs flex items-center justify-center mt-1 flex-shrink-0">
                {objectives.length + 1}
              </span>
              <div className="flex-1">
                <textarea
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 resize-none"
                  placeholder="เพิ่มวัตถุประสงค์ใหม่... (กด Enter เพื่อเพิ่ม)"
                />
              </div>
              <button
                onClick={handleAddObjective}
                disabled={!newObjective.trim()}
                className={`p-2 rounded mt-1 ${
                  newObjective.trim()
                    ? 'text-login-learning-600 hover:text-login-learning-800 hover:bg-login-learning-50'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title="เพิ่มวัตถุประสงค์"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">
              คำแนะนำในการเขียนวัตถุประสงค์
            </h4>
            <div className="mt-1 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>เริ่มต้นด้วยคำกริยาที่วัดผลได้ เช่น "อธิบาย" "วิเคราะห์" "สร้าง"</li>
                <li>ระบุให้ชัดเจนว่าผู้เรียนจะสามารถทำอะไรได้หลังเรียนจบ</li>
                <li>ควรมีวัตถุประสงค์ 3-5 ข้อต่อบทเรียน</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};