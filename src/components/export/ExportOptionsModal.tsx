'use client';

import React, { useState } from 'react';
import { ExportOptions } from '@/services/exportService';
import Card from '@/components/ui/Card';

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'web' | 'json', options: ExportOptions) => void;
  isExporting: boolean;
}

export default function ExportOptionsModal({
  isOpen,
  onClose,
  onExport,
  isExporting
}: ExportOptionsModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'web' | 'json'>('pdf');
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeImages: true,
    pageSize: 'A4',
    orientation: 'portrait',
    quality: 'medium',
    watermark: true
  });

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExport = () => {
    onExport(selectedFormat, { ...options, format: selectedFormat });
  };

  const formatOptions = [
    {
      id: 'pdf',
      name: 'PDF',
      description: 'ไฟล์ PDF สำหรับพิมพ์และแชร์',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'text-red-600'
    },
    {
      id: 'web',
      name: 'เว็บแชร์',
      description: 'ลิงค์สำหรับแชร์ออนไลน์',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      color: 'text-blue-600'
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'ไฟล์ข้อมูลสำหรับสำรองหรือนำเข้า',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      color: 'text-green-600'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-xl border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">ส่งออกชีทเรียน</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isExporting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">เลือกรูปแบบการส่งออก</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formatOptions.map(format => (
                <div
                  key={format.id}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                    selectedFormat === format.id
                      ? 'border-login-learning-500 bg-login-learning-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedFormat(format.id as any)}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`${format.color}`}>
                      {format.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{format.name}</h4>
                      <p className="text-sm text-gray-600">{format.description}</p>
                    </div>
                  </div>
                  {selectedFormat === format.id && (
                    <div className="absolute top-2 right-2">
                      <div className="w-5 h-5 bg-login-learning-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* PDF Options */}
          {selectedFormat === 'pdf' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">ตัวเลือก PDF</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Page Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ขนาดหน้ากระดาษ
                  </label>
                  <select
                    value={options.pageSize}
                    onChange={(e) => handleOptionChange('pageSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500"
                  >
                    <option value="A4">A4 (210 x 297 mm)</option>
                    <option value="Letter">Letter (216 x 279 mm)</option>
                    <option value="A3">A3 (297 x 420 mm)</option>
                  </select>
                </div>

                {/* Orientation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    การวางแนว
                  </label>
                  <select
                    value={options.orientation}
                    onChange={(e) => handleOptionChange('orientation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500"
                  >
                    <option value="portrait">แนวตั้ง (Portrait)</option>
                    <option value="landscape">แนวนอน (Landscape)</option>
                  </select>
                </div>

                {/* Quality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คุณภาพไฟล์
                  </label>
                  <select
                    value={options.quality}
                    onChange={(e) => handleOptionChange('quality', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-login-learning-500 focus:border-login-learning-500"
                  >
                    <option value="low">ต่ำ (ไฟล์เล็ก)</option>
                    <option value="medium">ปานกลาง (แนะนำ)</option>
                    <option value="high">สูง (ไฟล์ใหญ่)</option>
                  </select>
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.includeImages}
                    onChange={(e) => handleOptionChange('includeImages', e.target.checked)}
                    className="h-4 w-4 text-login-learning-600 focus:ring-login-learning-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">รวมรูปภาพในไฟล์</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.watermark}
                    onChange={(e) => handleOptionChange('watermark', e.target.checked)}
                    className="h-4 w-4 text-login-learning-600 focus:ring-login-learning-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">เพิ่มลายน้ำ Login-Learning</span>
                </label>
              </div>
            </div>
          )}

          {/* Web Export Options */}
          {selectedFormat === 'web' && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-blue-900">การแชร์ออนไลน์</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    สร้างลิงค์สำหรับแชร์ชีทเรียนออนไลน์ ผู้อื่นสามารถเปิดดูได้โดยไม่ต้องดาวน์โหลด
                    ลิงค์จะมีอายุ 30 วันหลังจากสร้าง
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* JSON Export Options */}
          {selectedFormat === 'json' && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-green-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-green-900">ไฟล์ข้อมูล JSON</h4>
                  <p className="text-sm text-green-700 mt-1">
                    ส่งออกเป็นไฟล์ข้อมูลสำหรับการสำรองหรือนำเข้าไปยังระบบอื่น
                    รองรับการนำเข้ากลับมาแก้ไขใน GenCouce
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white rounded-b-xl border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
              disabled={isExporting}
            >
              ยกเลิก
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-6 py-2 bg-login-learning-600 text-white rounded-lg hover:bg-login-learning-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังส่งออก...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  ส่งออก
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}