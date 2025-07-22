'use client';

import React from 'react';
import { ExportProgress, ExportResult } from '@/services/exportService';
import { exportService } from '@/services/exportService';

interface ExportProgressModalProps {
  isOpen: boolean;
  progress: ExportProgress | null;
  result: ExportResult | null;
  error: string | null;
  onClose: () => void;
  onDownload: () => void;
  onCopyShareUrl?: () => Promise<boolean>;
  onRetry?: () => void;
}

export default function ExportProgressModal({
  isOpen,
  progress,
  result,
  error,
  onClose,
  onDownload,
  onCopyShareUrl,
  onRetry
}: ExportProgressModalProps) {
  const [copySuccess, setCopySuccess] = React.useState(false);

  const handleCopyShareUrl = async () => {
    if (onCopyShareUrl) {
      const success = await onCopyShareUrl();
      setCopySuccess(success);
      if (success) {
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  if (!isOpen) return null;

  const progressPercent = progress ? Math.round((progress.progress / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {progress ? 'กำลังส่งออก...' : result?.success ? 'ส่งออกสำเร็จ!' : 'เกิดข้อผิดพลาด'}
            </h2>
            {(!progress && (result || error)) && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Progress State */}
          {progress && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercent / 100)}`}
                      className="text-login-learning-500 transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700">{progressPercent}%</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">{progress.message}</p>
                <p className="text-xs text-gray-500">
                  ขั้นตอนที่ {progress.progress + 1} จาก {progress.total}
                </p>
              </div>

              {/* Progress Steps */}
              <div className="space-y-2">
                {[
                  { step: 'preparing', label: 'เตรียมข้อมูล' },
                  { step: 'capturing', label: 'จับภาพเนื้อหา' },
                  { step: 'converting', label: 'แปลงไฟล์' },
                  { step: 'metadata', label: 'เพิ่มข้อมูลเมตะ' },
                  { step: 'finalizing', label: 'สร้างไฟล์' }
                ].map((item, index) => (
                  <div key={item.step} className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full flex-shrink-0 ${
                      index < progress.progress
                        ? 'bg-green-500'
                        : index === progress.progress
                        ? 'bg-login-learning-500'
                        : 'bg-gray-200'
                    }`}>
                      {index < progress.progress && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${
                      index <= progress.progress ? 'text-gray-900 font-medium' : 'text-gray-500'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success State */}
          {result?.success && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ส่งออกสำเร็จ!</h3>
                <p className="text-sm text-gray-600 mb-1">ไฟล์ถูกสร้างเรียบร้อยแล้ว</p>
                {result.size && (
                  <p className="text-xs text-gray-500">
                    ขนาดไฟล์: {exportService.formatFileSize(result.size)}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Download Button */}
                <button
                  onClick={onDownload}
                  className="w-full bg-login-learning-600 text-white py-3 px-4 rounded-lg hover:bg-login-learning-700 transition-colors duration-200 font-medium flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  ดาวน์โหลดไฟล์
                </button>

                {/* Share URL Button (for web exports) */}
                {result.shareUrl && (
                  <button
                    onClick={handleCopyShareUrl}
                    className={`w-full py-3 px-4 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center ${
                      copySuccess
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
                    }`}
                  >
                    {copySuccess ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        คัดลอกแล้ว!
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        คัดลอกลิงค์แชร์
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* File Name */}
              {result.fileName && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">ชื่อไฟล์:</p>
                  <p className="text-sm font-mono text-gray-800 break-all">{result.fileName}</p>
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">เกิดข้อผิดพลาด</h3>
                <p className="text-sm text-red-600 mb-4">{error}</p>
              </div>

              {/* Retry Button */}
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  ลองใหม่
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {(!progress && (result || error)) && (
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm font-medium"
            >
              ปิด
            </button>
          </div>
        )}
      </div>
    </div>
  );
}