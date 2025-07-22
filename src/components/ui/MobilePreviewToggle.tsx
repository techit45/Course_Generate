import { useState } from 'react';
import { StudySheetForm } from '@/types';
import RealtimePreview from '@/components/RealtimePreview';

interface MobilePreviewToggleProps {
  formData: Partial<StudySheetForm>;
}

export default function MobilePreviewToggle({ formData }: MobilePreviewToggleProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="lg:hidden mt-6">
      {/* Toggle Button */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="w-full flex items-center justify-center space-x-2 bg-login-learning-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-login-learning-700 focus:outline-none focus:ring-2 focus:ring-login-learning-500 focus:ring-offset-2 transition-colors duration-200"
      >
        <svg 
          className={`w-5 h-5 transition-transform duration-200 ${showPreview ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>{showPreview ? 'ซ่อนตัวอย่าง' : 'แสดงตัวอย่างชีทเรียน'}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${showPreview ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsible Preview */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        showPreview ? 'max-h-screen opacity-100 mt-4' : 'max-h-0 opacity-0'
      }`}>
        <RealtimePreview formData={formData} />
      </div>
    </div>
  );
}