import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
  animated?: boolean;
  showTimeRemaining?: boolean;
  estimatedDuration?: number; // in milliseconds
  startTime?: number;
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
};

const colorClasses = {
  primary: 'bg-login-learning-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600'
};

export default function ProgressBar({
  progress,
  label,
  showPercentage = false,
  size = 'md',
  color = 'primary',
  className = '',
  animated = false,
  showTimeRemaining = false,
  estimatedDuration,
  startTime = Date.now()
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const [timeRemaining, setTimeRemaining] = React.useState<string>('');

  // Calculate time remaining
  React.useEffect(() => {
    if (!showTimeRemaining || !estimatedDuration || clampedProgress === 0) {
      setTimeRemaining('');
      return;
    }

    const calculateTimeRemaining = () => {
      const elapsed = Date.now() - startTime;
      const estimatedTotal = estimatedDuration;
      const progressRatio = clampedProgress / 100;
      
      if (progressRatio > 0) {
        const estimatedElapsed = estimatedTotal * progressRatio;
        const remaining = Math.max(0, estimatedTotal - estimatedElapsed);
        
        if (remaining > 0) {
          const seconds = Math.ceil(remaining / 1000);
          if (seconds < 60) {
            setTimeRemaining(`${seconds}วินาที`);
          } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            setTimeRemaining(`${minutes}:${remainingSeconds.toString().padStart(2, '0')}`);
          }
        } else {
          setTimeRemaining('');
        }
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [clampedProgress, estimatedDuration, startTime, showTimeRemaining]);

  return (
    <div className={className}>
      {(label || showPercentage || timeRemaining) && (
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center space-x-2">
            {label && (
              <span className="text-sm font-medium text-login-learning-700">{label}</span>
            )}
            {timeRemaining && (
              <span className="text-xs text-login-learning-500 bg-login-learning-50 px-2 py-0.5 rounded">
                ⏱️ {timeRemaining}
              </span>
            )}
          </div>
          {showPercentage && (
            <span className="text-sm text-login-learning-500 font-mono">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-login-learning-100 rounded-full ${sizeClasses[size]} shadow-inner overflow-hidden`}>
        <div
          className={`${sizeClasses[size]} rounded-full transition-all duration-300 ease-out ${colorClasses[color]} ${
            animated ? 'bg-gradient-to-r from-current to-current bg-[length:200%_100%] animate-pulse' : ''
          }`}
          style={{ 
            width: `${clampedProgress}%`,
            ...(animated && {
              backgroundImage: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`
            })
          }}
        />
        
        {/* Animated shimmer effect */}
        {animated && clampedProgress > 0 && (
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"
            style={{ width: '30%', animation: 'shimmer 2s infinite' }}
          />
        )}
      </div>
      
      {/* Add shimmer animation styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}