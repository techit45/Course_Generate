import React from 'react';

interface LoginLearningLogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'dark' | 'gradient';
  className?: string;
}

const LoginLearningLogo: React.FC<LoginLearningLogoProps> = ({ 
  variant = 'full', 
  size = 'md', 
  color = 'primary',
  className = '' 
}) => {
  // Size configurations
  const sizeConfig = {
    sm: { 
      container: 'h-8', 
      icon: 'w-8 h-8', 
      text: 'text-lg', 
      spacing: 'space-x-2' 
    },
    md: { 
      container: 'h-12', 
      icon: 'w-12 h-12', 
      text: 'text-2xl', 
      spacing: 'space-x-3' 
    },
    lg: { 
      container: 'h-16', 
      icon: 'w-16 h-16', 
      text: 'text-3xl', 
      spacing: 'space-x-4' 
    },
    xl: { 
      container: 'h-20', 
      icon: 'w-20 h-20', 
      text: 'text-4xl', 
      spacing: 'space-x-5' 
    }
  };

  // Color configurations
  const colorConfig = {
    primary: {
      icon: 'text-login-learning-600',
      text: 'text-login-learning-800',
      gradient: 'from-login-learning-600 to-login-learning-800'
    },
    white: {
      icon: 'text-white',
      text: 'text-white',
      gradient: 'from-white to-gray-100'
    },
    dark: {
      icon: 'text-gray-800',
      text: 'text-gray-900',
      gradient: 'from-gray-800 to-gray-900'
    },
    gradient: {
      icon: 'text-transparent bg-clip-text bg-gradient-to-r from-login-learning-600 to-blue-600',
      text: 'text-transparent bg-clip-text bg-gradient-to-r from-login-learning-600 to-blue-600',
      gradient: 'from-login-learning-600 to-blue-600'
    }
  };

  const currentSize = sizeConfig[size];
  const currentColor = colorConfig[color];

  // Login-Learning Icon SVG
  const LoginLearningIcon = () => (
    <div className={`${currentSize.icon} ${currentColor.icon} flex items-center justify-center relative`}>
      {color === 'gradient' ? (
        <div className="relative">
          {/* Gradient background for icon */}
          <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${currentColor.gradient} opacity-20`} />
          {/* Main icon */}
          <svg 
            viewBox="0 0 100 100" 
            className={`${currentSize.icon} relative z-10`}
            fill="currentColor"
          >
            {/* Learning Book Base */}
            <rect x="15" y="25" width="50" height="60" rx="4" fill="currentColor" opacity="0.8"/>
            
            {/* Open Book Pages */}
            <path d="M20 30 L35 30 L35 75 L20 75 Z" fill="currentColor" opacity="0.9"/>
            <path d="M35 30 L60 30 L60 75 L35 75 Z" fill="currentColor" opacity="0.6"/>
            
            {/* Login Icon - Key/Lock combination */}
            <circle cx="75" cy="35" r="8" fill="currentColor"/>
            <rect x="67" y="40" width="16" height="12" rx="2" fill="currentColor" opacity="0.9"/>
            <circle cx="75" cy="46" r="2" fill="white"/>
            
            {/* Knowledge Connection Lines */}
            <path d="M65 35 L45 50" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7"/>
            <path d="M65 40 L45 55" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5"/>
            
            {/* Success Checkmark */}
            <circle cx="80" cy="65" r="10" fill="currentColor" opacity="0.9"/>
            <path d="M75 65 L78 68 L85 61" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ) : (
        <svg 
          viewBox="0 0 100 100" 
          className={currentSize.icon}
          fill="currentColor"
        >
          {/* Learning Book Base */}
          <rect x="15" y="25" width="50" height="60" rx="4" fill="currentColor" opacity="0.8"/>
          
          {/* Open Book Pages */}
          <path d="M20 30 L35 30 L35 75 L20 75 Z" fill="currentColor" opacity="0.9"/>
          <path d="M35 30 L60 30 L60 75 L35 75 Z" fill="currentColor" opacity="0.6"/>
          
          {/* Login Icon - Key/Lock combination */}
          <circle cx="75" cy="35" r="8" fill="currentColor"/>
          <rect x="67" y="40" width="16" height="12" rx="2" fill="currentColor" opacity="0.9"/>
          <circle cx="75" cy="46" r="2" fill="white"/>
          
          {/* Knowledge Connection Lines */}
          <path d="M65 35 L45 50" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7"/>
          <path d="M65 40 L45 55" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5"/>
          
          {/* Success Checkmark */}
          <circle cx="80" cy="65" r="10" fill="currentColor" opacity="0.9"/>
          <path d="M75 65 L78 68 L85 61" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );

  // Company Name Text
  const CompanyText = () => (
    <div className="flex flex-col">
      <span className={`${currentSize.text} font-bold ${currentColor.text} leading-tight`}>
        Login-Learning
      </span>
      {size !== 'sm' && (
        <span className={`text-xs ${currentColor.text} opacity-75 font-medium tracking-wide`}>
          Educational Technology
        </span>
      )}
    </div>
  );

  // Render based on variant
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <LoginLearningIcon />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <CompanyText />
      </div>
    );
  }

  // Full logo (default)
  return (
    <div className={`inline-flex items-center ${currentSize.spacing} ${className}`}>
      <LoginLearningIcon />
      <CompanyText />
    </div>
  );
};

export default LoginLearningLogo;