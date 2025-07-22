import React, { useEffect, useState } from 'react';
import { performanceService } from '@/services/performanceService';

export interface ProgressStage {
  id: string;
  label: string;
  description?: string;
  estimatedDuration: number; // in milliseconds
  icon?: React.ReactNode;
}

export interface AdvancedProgressProps {
  stages: ProgressStage[];
  currentStageIndex: number;
  currentStageProgress: number; // 0-100
  totalProgress: number; // 0-100
  isIndeterminate?: boolean;
  showTimeRemaining?: boolean;
  showPerformanceMetrics?: boolean;
  onCancel?: () => void;
  className?: string;
}

interface PerformanceMetric {
  label: string;
  value: string;
  status: 'good' | 'warning' | 'error';
}

const AdvancedProgressIndicator: React.FC<AdvancedProgressProps> = ({
  stages,
  currentStageIndex,
  currentStageProgress,
  totalProgress,
  isIndeterminate = false,
  showTimeRemaining = true,
  showPerformanceMetrics = false,
  onCancel,
  className = ''
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [startTime] = useState<number>(Date.now());

  // Calculate estimated time remaining
  useEffect(() => {
    if (!showTimeRemaining || isIndeterminate) return;

    const calculateTimeRemaining = () => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);

      if (totalProgress > 0 && totalProgress < 100) {
        const estimatedTotal = (elapsed / totalProgress) * 100;
        const remaining = estimatedTotal - elapsed;
        setTimeRemaining(Math.max(0, remaining));
      }
    };

    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [totalProgress, startTime, showTimeRemaining, isIndeterminate]);

  // Update performance metrics
  useEffect(() => {
    if (!showPerformanceMetrics) return;

    const updateMetrics = () => {
      const report = performanceService.generateReport();
      const cacheStats = performanceService.getRecentMetrics(1);
      
      const metrics: PerformanceMetric[] = [
        {
          label: 'Response Time',
          value: `${report.averageResponseTime.toFixed(0)}ms`,
          status: report.averageResponseTime < 1000 ? 'good' : 
                  report.averageResponseTime < 2500 ? 'warning' : 'error'
        },
        {
          label: 'Cache Hit Rate',
          value: `${report.cacheHitRate.toFixed(1)}%`,
          status: report.cacheHitRate > 70 ? 'good' : 
                  report.cacheHitRate > 40 ? 'warning' : 'error'
        },
        {
          label: 'Memory Usage',
          value: `${report.memoryUsage.toFixed(1)}MB`,
          status: report.memoryUsage < 50 ? 'good' : 
                  report.memoryUsage < 80 ? 'warning' : 'error'
        }
      ];
      
      setPerformanceMetrics(metrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);
    return () => clearInterval(interval);
  }, [showPerformanceMetrics]);

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) {
      return `${seconds} วินาที`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} นาที ${remainingSeconds} วินาที`;
  };

  const getStageStatus = (stageIndex: number): 'completed' | 'active' | 'pending' => {
    if (stageIndex < currentStageIndex) return 'completed';
    if (stageIndex === currentStageIndex) return 'active';
    return 'pending';
  };

  const getStatusColor = (status: 'good' | 'warning' | 'error'): string => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const currentStage = stages[currentStageIndex];

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {currentStage ? currentStage.label : 'กำลังประมวลผล'}
          </h3>
          {currentStage?.description && (
            <p className="text-sm text-gray-600">{currentStage.description}</p>
          )}
        </div>
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="ml-4 px-3 py-1 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
        )}
      </div>

      {/* Main Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">ความคืบหน้าโดยรวม</span>
          <span className="text-sm text-gray-500">{Math.round(totalProgress)}%</span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ease-out ${
                isIndeterminate 
                  ? 'bg-gradient-to-r from-login-learning-400 via-login-learning-600 to-login-learning-400 animate-pulse'
                  : 'bg-gradient-to-r from-login-learning-500 to-login-learning-600'
              }`}
              style={{ 
                width: isIndeterminate ? '100%' : `${totalProgress}%`,
                backgroundSize: isIndeterminate ? '200% 100%' : '100% 100%',
                animation: isIndeterminate ? 'shimmer 2s infinite linear' : undefined
              }}
            />
          </div>
          
          {/* Performance indicator overlay */}
          {showPerformanceMetrics && (
            <div className="absolute -top-1 -right-1">
              <div className={`w-2 h-2 rounded-full ${
                performanceMetrics.some(m => m.status === 'error') ? 'bg-red-400' :
                performanceMetrics.some(m => m.status === 'warning') ? 'bg-yellow-400' :
                'bg-green-400'
              } animate-pulse`} />
            </div>
          )}
        </div>
      </div>

      {/* Current Stage Progress */}
      {currentStage && !isIndeterminate && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-600">
              ขั้นตอนปัจจุบัน: {currentStage.label}
            </span>
            <span className="text-xs text-gray-500">{Math.round(currentStageProgress)}%</span>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div 
              className="bg-login-learning-400 h-1.5 rounded-full transition-all duration-200"
              style={{ width: `${currentStageProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stage Timeline */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          {stages.map((stage, index) => {
            const status = getStageStatus(index);
            return (
              <div key={stage.id} className="flex-1 flex items-center">
                {/* Stage Circle */}
                <div className="relative flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                    status === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : status === 'active'
                      ? 'bg-login-learning-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {status === 'completed' ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      stage.icon || (index + 1)
                    )}
                  </div>
                  
                  {/* Active Stage Pulse */}
                  {status === 'active' && (
                    <div className="absolute inset-0 rounded-full bg-login-learning-500 animate-ping opacity-30" />
                  )}
                </div>

                {/* Connection Line */}
                {index < stages.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Stage Labels */}
        <div className="flex justify-between mt-2">
          {stages.map((stage, index) => (
            <div key={`${stage.id}-label`} className="flex-1 text-center">
              <p className={`text-xs truncate px-1 ${
                getStageStatus(index) === 'active' 
                  ? 'text-login-learning-600 font-medium' 
                  : 'text-gray-500'
              }`}>
                {stage.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Time and Performance Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        {/* Time Information */}
        {showTimeRemaining && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">เวลาที่ใช้ไป:</span>
              <span className="text-xs font-mono text-gray-900">
                {formatTime(elapsedTime)}
              </span>
            </div>
            
            {!isIndeterminate && timeRemaining > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">เวลาที่เหลือ:</span>
                <span className="text-xs font-mono text-login-learning-600">
                  ประมาณ {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Performance Metrics */}
        {showPerformanceMetrics && performanceMetrics.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-700">ประสิทธิภาพ:</h4>
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-xs text-gray-600">{metric.label}:</span>
                <span className={`text-xs font-mono ${getStatusColor(metric.status)}`}>
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional CSS for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AdvancedProgressIndicator;