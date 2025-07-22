'use client';

import React, { useState } from 'react';
import { StudySheetContent, WebExportOptions, WebThemeOptions } from '@/types';
import { exportStudySheetToWeb } from '@/services/webExportService';
import { DEFAULT_WEB_OPTIONS, LOGIN_LEARNING_WEB_THEME } from '@/config/webTemplates';

interface WebExportButtonProps {
  studySheetContent: StudySheetContent;
  className?: string;
  buttonText?: string;
  options?: Partial<WebExportOptions>;
  theme?: Partial<WebThemeOptions>;
  onExportStart?: () => void;
  onExportComplete?: (success: boolean, url?: string) => void;
  onExportError?: (error: string) => void;
}

export const WebExportButton: React.FC<WebExportButtonProps> = ({
  studySheetContent,
  className = '',
  buttonText = 'สร้างเว็บไซต์',
  options = {},
  theme = {},
  onExportStart,
  onExportComplete,
  onExportError
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    
    if (onExportStart) {
      onExportStart();
    }

    try {
      const result = await exportStudySheetToWeb(
        studySheetContent,
        { ...DEFAULT_WEB_OPTIONS, ...options },
        { ...LOGIN_LEARNING_WEB_THEME, ...theme }
      );

      if (result.success && result.htmlContent) {
        // Create blob and download link
        const blob = new Blob([result.htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = generateWebFilename(studySheetContent);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        if (onExportComplete) {
          onExportComplete(true, url);
        }
      } else {
        throw new Error(result.error || 'ไม่สามารถสร้างเว็บไซต์ได้');
      }
    } catch (error) {
      console.error('Web export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้างเว็บไซต์';
      
      if (onExportError) {
        onExportError(errorMessage);
      }
      
      if (onExportComplete) {
        onExportComplete(false);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const generateWebFilename = (content: StudySheetContent): string => {
    const title = content.title.replace(/[^a-zA-Z0-9ก-๙]/g, '_');
    const date = new Date().toISOString().split('T')[0];
    const grade = content.metadata?.difficultyLevel || 'Unknown';
    return `StudySheet_${title}_${grade}_${date}.html`;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`
          px-6 py-3 rounded-lg font-medium transition-all duration-200
          flex items-center justify-center space-x-2 min-w-[160px]
          ${isExporting 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
          }
        `}
      >
        {isExporting ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>กำลังสร้าง...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
            </svg>
            <span>{buttonText}</span>
          </>
        )}
      </button>

      {/* Options button */}
      <button
        onClick={() => setShowOptions(true)}
        disabled={isExporting}
        className="ml-2 px-3 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 flex items-center"
        title="ตั้งค่าเว็บไซต์ขั้นสูง"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Web Options Modal */}
      <WebExportOptionsModal
        isOpen={showOptions}
        onClose={() => setShowOptions(false)}
        onExport={handleExport}
        currentOptions={DEFAULT_WEB_OPTIONS}
      />
    </div>
  );
};

interface WebExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  currentOptions: WebExportOptions;
}

export const WebExportOptionsModal: React.FC<WebExportOptionsModalProps> = ({
  isOpen,
  onClose,
  onExport,
  currentOptions
}) => {
  const [options, setOptions] = useState<WebExportOptions>(currentOptions);

  if (!isOpen) return null;

  const handleExport = () => {
    onExport();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">ตั้งค่าเว็บไซต์</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Navigation Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รูปแบบการนำทาง
              </label>
              <select
                value={options.navigationStyle}
                onChange={(e) => setOptions({ ...options, navigationStyle: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="sidebar">แถบด้านข้าง</option>
                <option value="tabs">แท็บ</option>
                <option value="accordion">อะคอร์เดียน</option>
                <option value="single-page">หน้าเดียว</option>
              </select>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeAnimations}
                  onChange={(e) => setOptions({ ...options, includeAnimations: e.target.checked })}
                  className="mr-2"
                />
                รวมภาพเคลื่อนไหว
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeInteractivity}
                  onChange={(e) => setOptions({ ...options, includeInteractivity: e.target.checked })}
                  className="mr-2"
                />
                เพิ่มความโต้ตอบ
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.printFriendly}
                  onChange={(e) => setOptions({ ...options, printFriendly: e.target.checked })}
                  className="mr-2"
                />
                รองรับการพิมพ์
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.darkModeSupport}
                  onChange={(e) => setOptions({ ...options, darkModeSupport: e.target.checked })}
                  className="mr-2"
                />
                รองรับโหมดมืด
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.accessibilityFeatures}
                  onChange={(e) => setOptions({ ...options, accessibilityFeatures: e.target.checked })}
                  className="mr-2"
                />
                คุณสมบัติการเข้าถึง
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.shareableUrl}
                  onChange={(e) => setOptions({ ...options, shareableUrl: e.target.checked })}
                  className="mr-2"
                />
                สร้าง URL สำหรับแชร์
              </label>
            </div>

            {/* Responsive Breakpoints */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                จุดแบ่งหน้าจอ (px)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">มือถือ</label>
                  <input
                    type="number"
                    value={options.responsiveBreakpoints.mobile}
                    onChange={(e) => setOptions({
                      ...options,
                      responsiveBreakpoints: {
                        ...options.responsiveBreakpoints,
                        mobile: parseInt(e.target.value)
                      }
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">แท็บเล็ต</label>
                  <input
                    type="number"
                    value={options.responsiveBreakpoints.tablet}
                    onChange={(e) => setOptions({
                      ...options,
                      responsiveBreakpoints: {
                        ...options.responsiveBreakpoints,
                        tablet: parseInt(e.target.value)
                      }
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">เดสก์ท็อป</label>
                  <input
                    type="number"
                    value={options.responsiveBreakpoints.desktop}
                    onChange={(e) => setOptions({
                      ...options,
                      responsiveBreakpoints: {
                        ...options.responsiveBreakpoints,
                        desktop: parseInt(e.target.value)
                      }
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">เดสก์ท็อปใหญ่</label>
                  <input
                    type="number"
                    value={options.responsiveBreakpoints.largeDesktop}
                    onChange={(e) => setOptions({
                      ...options,
                      responsiveBreakpoints: {
                        ...options.responsiveBreakpoints,
                        largeDesktop: parseInt(e.target.value)
                      }
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleExport}
              className="flex-1 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
            >
              สร้างเว็บไซต์
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebExportButton;