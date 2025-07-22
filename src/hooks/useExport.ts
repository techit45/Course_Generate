import { useState, useCallback } from 'react';
import { StudySheetContent } from '@/types';
import { exportService, ExportOptions, ExportProgress, ExportResult } from '@/services/exportService';

export interface UseExportState {
  isExporting: boolean;
  exportProgress: ExportProgress | null;
  exportResult: ExportResult | null;
  error: string | null;
}

export interface UseExportReturn extends UseExportState {
  exportToPDF: (content: StudySheetContent, element: HTMLElement, options?: Partial<ExportOptions>) => Promise<void>;
  exportToWeb: (content: StudySheetContent) => Promise<void>;
  exportToJSON: (content: StudySheetContent) => Promise<void>;
  downloadResult: () => void;
  copyShareUrl: () => Promise<boolean>;
  clearResult: () => void;
  clearError: () => void;
}

export const useExport = (): UseExportReturn => {
  const [state, setState] = useState<UseExportState>({
    isExporting: false,
    exportProgress: null,
    exportResult: null,
    error: null
  });

  // Set up progress callback
  exportService.setProgressCallback((progress: ExportProgress) => {
    setState(prev => ({
      ...prev,
      exportProgress: progress
    }));
  });

  const clearState = useCallback(() => {
    setState(prev => ({
      ...prev,
      isExporting: false,
      exportProgress: null,
      error: null
    }));
  }, []);

  const exportToPDF = useCallback(async (
    content: StudySheetContent, 
    element: HTMLElement,
    options: Partial<ExportOptions> = {}
  ) => {
    setState(prev => ({
      ...prev,
      isExporting: true,
      exportProgress: null,
      exportResult: null,
      error: null
    }));

    try {
      const defaultOptions: ExportOptions = {
        format: 'pdf',
        includeImages: true,
        pageSize: 'A4',
        orientation: 'portrait',
        quality: 'medium',
        watermark: true
      };

      const mergedOptions = { ...defaultOptions, ...options };
      const result = await exportService.exportToPDF(content, element, mergedOptions);

      setState(prev => ({
        ...prev,
        isExporting: false,
        exportResult: result,
        error: result.success ? null : result.error || 'การสร้าง PDF ล้มเหลว'
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isExporting: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      }));
    }
  }, []);

  const exportToWeb = useCallback(async (content: StudySheetContent) => {
    setState(prev => ({
      ...prev,
      isExporting: true,
      exportProgress: null,
      exportResult: null,
      error: null
    }));

    try {
      const result = await exportService.exportToWeb(content);

      setState(prev => ({
        ...prev,
        isExporting: false,
        exportResult: result,
        error: result.success ? null : result.error || 'การเตรียมข้อมูลแชร์ล้มเหลว'
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isExporting: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      }));
    }
  }, []);

  const exportToJSON = useCallback(async (content: StudySheetContent) => {
    setState(prev => ({
      ...prev,
      isExporting: true,
      exportProgress: null,
      exportResult: null,
      error: null
    }));

    try {
      const result = await exportService.exportToJSON(content);

      setState(prev => ({
        ...prev,
        isExporting: false,
        exportResult: result,
        error: result.success ? null : result.error || 'การสร้างไฟล์ JSON ล้มเหลว'
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isExporting: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      }));
    }
  }, []);

  const downloadResult = useCallback(() => {
    if (state.exportResult?.downloadUrl && state.exportResult?.fileName) {
      exportService.downloadFile(state.exportResult.downloadUrl, state.exportResult.fileName);
    }
  }, [state.exportResult]);

  const copyShareUrl = useCallback(async (): Promise<boolean> => {
    if (state.exportResult?.shareUrl) {
      return await exportService.copyToClipboard(state.exportResult.shareUrl);
    }
    return false;
  }, [state.exportResult]);

  const clearResult = useCallback(() => {
    // Clean up URL if it exists
    if (state.exportResult?.downloadUrl) {
      URL.revokeObjectURL(state.exportResult.downloadUrl);
    }

    setState(prev => ({
      ...prev,
      exportResult: null,
      exportProgress: null,
      error: null
    }));
  }, [state.exportResult]);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  return {
    ...state,
    exportToPDF,
    exportToWeb,
    exportToJSON,
    downloadResult,
    copyShareUrl,
    clearResult,
    clearError
  };
};