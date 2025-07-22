'use client';

import React from 'react';

interface TitleEditorProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  isReadonly?: boolean;
}

export const TitleEditor: React.FC<TitleEditorProps> = ({
  title,
  onTitleChange,
  isReadonly = false
}) => {
  return (
    <div>
      <h3 className="text-lg font-bold text-login-learning-800 mb-4 flex items-center">
        <span className="inline-block w-8 h-8 bg-login-learning-100 rounded-full flex items-center justify-center mr-3">
          📝
        </span>
        ชื่อแผ่นงานการเรียนรู้
      </h3>
      
      <div>
        <label htmlFor="title-input" className="block text-sm font-medium text-gray-700 mb-2">
          ชื่อเรื่อง
        </label>
        <input
          id="title-input"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={isReadonly}
          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500 disabled:bg-gray-50 disabled:text-gray-500"
          placeholder="ระบุชื่อแผ่นงานการเรียนรู้..."
        />
        <p className="text-sm text-gray-500 mt-1">
          ชื่อที่จะแสดงบนหน้าปกและส่วนหัวของแผ่นงาน
        </p>
      </div>
    </div>
  );
};