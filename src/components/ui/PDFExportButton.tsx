'use client';

import React, { useState } from 'react';
import { StudySheetContent, PDFOptions, BrandingOptions, PDFExportProgress } from '@/types';
import { generateStudySheetPDF } from '@/services/pdfService';
import { DEFAULT_PDF_OPTIONS, LOGIN_LEARNING_BRANDING } from '@/config/pdfTemplates';

interface PDFExportButtonProps {
  studySheetContent: StudySheetContent;
  className?: string;
  buttonText?: string;
  options?: Partial<PDFOptions>;
  branding?: Partial<BrandingOptions>;
  onExportStart?: () => void;
  onExportComplete?: (success: boolean, filename?: string) => void;
  onExportError?: (error: string) => void;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  studySheetContent,
  className = '',
  buttonText = 'ดาวน์โหลด PDF',
  options = {},
  branding = {},
  onExportStart,
  onExportComplete,
  onExportError
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<PDFExportProgress | null>(null);

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setProgress({ stage: 'preparing', progress: 0 });
    
    if (onExportStart) {
      onExportStart();
    }

    try {
      const result = await generateStudySheetPDF(
        studySheetContent,
        { ...DEFAULT_PDF_OPTIONS, ...options },
        { ...LOGIN_LEARNING_BRANDING, ...branding },
        (progressUpdate) => {
          setProgress(progressUpdate);
        }
      );

      if (result.success && result.pdfBlob) {
        // Create download link
        const url = URL.createObjectURL(result.pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        if (onExportComplete) {
          onExportComplete(true, result.filename);
        }
      } else {
        throw new Error(result.error || 'ไม่สามารถสร้าง PDF ได้');
      }
    } catch (error) {
      console.error('PDF export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสร้าง PDF';
      
      if (onExportError) {
        onExportError(errorMessage);
      }
      
      if (onExportComplete) {
        onExportComplete(false);
      }
    } finally {
      setIsExporting(false);
      setProgress(null);
    }
  };

  const getProgressText = (): string => {
    if (!progress) return '';

    const stageTexts = {
      'preparing': 'เตรียมการสร้าง PDF...',
      'generating-content': 'กำลังสร้างเนื้อหา...',
      'adding-images': 'เพิ่มภาพและแผนภาพ...',
      'formatting': 'จัดรูปแบบเอกสาร...',
      'finalizing': 'กำลังเสร็จสิ้น...',
      'complete': 'เสร็จสิ้น!'
    };

    return stageTexts[progress.stage] || '';
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
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{buttonText}</span>
          </>
        )}
      </button>

      {/* Progress overlay */}
      {isExporting && progress && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700 mb-1">
                {getProgressText()}
              </div>
              {progress.currentSection && (
                <div className="text-xs text-gray-500 mb-2">
                  {progress.currentSection}
                </div>
              )}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {progress.progress}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface PDFOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: PDFOptions) => void;
  currentOptions: PDFOptions;
}

export const PDFOptionsModal: React.FC<PDFOptionsModalProps> = ({
  isOpen,
  onClose,
  onExport,
  currentOptions
}) => {
  const [options, setOptions] = useState<PDFOptions>(currentOptions);

  if (!isOpen) return null;

  const handleExport = () => {
    onExport(options);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">ตั้งค่า PDF</h3>
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
            {/* Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รูปแบบกระดาษ
              </label>
              <select
                value={options.format}
                onChange={(e) => setOptions({ ...options, format: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
              </select>
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                การวางกระดาษ
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="portrait"
                    checked={options.orientation === 'portrait'}
                    onChange={(e) => setOptions({ ...options, orientation: e.target.value as any })}
                    className="mr-2"
                  />
                  แนวตั้ง
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="landscape"
                    checked={options.orientation === 'landscape'}
                    onChange={(e) => setOptions({ ...options, orientation: e.target.value as any })}
                    className="mr-2"
                  />
                  แนวนอน
                </label>
              </div>
            </div>

            {/* Include options */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeImages}
                  onChange={(e) => setOptions({ ...options, includeImages: e.target.checked })}
                  className="mr-2"
                />
                รวมภาพประกอบ
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeDiagrams}
                  onChange={(e) => setOptions({ ...options, includeDiagrams: e.target.checked })}
                  className="mr-2"
                />
                รวมแผนภาพ
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.tableOfContents}
                  onChange={(e) => setOptions({ ...options, tableOfContents: e.target.checked })}
                  className="mr-2"
                />
                สารบัญ
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.pageNumbers}
                  onChange={(e) => setOptions({ ...options, pageNumbers: e.target.checked })}
                  className="mr-2"
                />
                หมายเลขหน้า
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.headerFooter}
                  onChange={(e) => setOptions({ ...options, headerFooter: e.target.checked })}
                  className="mr-2"
                />
                หัวกระดาษและท้ายกระดาษ
              </label>
            </div>

            {/* Note spacing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ระยะห่างสำหรับจดโน้ต
              </label>
              <select
                value={options.noteSpacing}
                onChange={(e) => setOptions({ ...options, noteSpacing: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="compact">กะทัดรัด</option>
                <option value="normal">ปกติ</option>
                <option value="spacious">กว้างขวาง</option>
              </select>
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
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              สร้าง PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFExportButton;