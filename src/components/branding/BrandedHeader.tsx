import React from 'react';
import LoginLearningLogo from './LoginLearningLogo';

interface BrandedHeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'hero' | 'section' | 'minimal';
  showLogo?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const BrandedHeader: React.FC<BrandedHeaderProps> = ({
  title,
  subtitle,
  variant = 'section',
  showLogo = true,
  className = '',
  children
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'hero':
        return {
          container: 'bg-gradient-to-br from-login-learning-600 via-blue-600 to-login-learning-700 text-white py-16 sm:py-20 lg:py-24',
          content: 'max-w-4xl mx-auto text-center space-y-6',
          title: 'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight',
          subtitle: 'text-lg sm:text-xl lg:text-2xl text-login-learning-100 max-w-2xl mx-auto',
          logo: { variant: 'full' as const, size: 'lg' as const, color: 'white' as const }
        };
      
      case 'section':
        return {
          container: 'bg-gradient-to-r from-login-learning-50 to-login-learning-100 py-8 sm:py-12 lg:py-16',
          content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4',
          title: 'text-2xl sm:text-3xl lg:text-4xl font-bold text-login-learning-800 tracking-tight',
          subtitle: 'text-base sm:text-lg lg:text-xl text-login-learning-600 max-w-3xl mx-auto',
          logo: { variant: 'full' as const, size: 'md' as const, color: 'primary' as const }
        };
      
      case 'minimal':
        return {
          container: 'bg-white border-b border-login-learning-100 py-6',
          content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between',
          title: 'text-xl sm:text-2xl font-bold text-login-learning-800',
          subtitle: 'text-sm sm:text-base text-login-learning-600',
          logo: { variant: 'full' as const, size: 'sm' as const, color: 'primary' as const }
        };
      
      default:
        return {
          container: 'bg-white py-8',
          content: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4',
          title: 'text-2xl sm:text-3xl font-bold text-login-learning-800',
          subtitle: 'text-base sm:text-lg text-login-learning-600',
          logo: { variant: 'full' as const, size: 'md' as const, color: 'primary' as const }
        };
    }
  };

  const styles = getVariantStyles();

  if (variant === 'minimal') {
    return (
      <header className={`${styles.container} ${className}`}>
        <div className={styles.content}>
          {showLogo && (
            <div className="flex-shrink-0">
              <LoginLearningLogo 
                variant={styles.logo.variant}
                size={styles.logo.size}
                color={styles.logo.color}
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0 ml-4">
            <h1 className={styles.title}>
              {title}
            </h1>
            {subtitle && (
              <p className={styles.subtitle}>
                {subtitle}
              </p>
            )}
          </div>
          
          {children && (
            <div className="flex-shrink-0 ml-4">
              {children}
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className={`${styles.container} ${className}`}>
      <div className={styles.content}>
        {showLogo && (
          <div className="flex justify-center mb-6">
            <LoginLearningLogo 
              variant={styles.logo.variant}
              size={styles.logo.size}
              color={styles.logo.color}
            />
          </div>
        )}
        
        <div className="space-y-4">
          <h1 className={styles.title}>
            {title}
          </h1>
          
          {subtitle && (
            <p className={styles.subtitle}>
              {subtitle}
            </p>
          )}
          
          {variant === 'hero' && (
            <div className="flex items-center justify-center space-x-3 pt-4">
              <div className="w-12 h-1 bg-white/30 rounded"></div>
              <span className="text-login-learning-100 font-medium text-sm tracking-wide">
                EDUCATIONAL TECHNOLOGY
              </span>
              <div className="w-12 h-1 bg-white/30 rounded"></div>
            </div>
          )}
        </div>
        
        {children && (
          <div className="pt-8">
            {children}
          </div>
        )}
      </div>
      
      {/* Brand Pattern Overlay for Hero */}
      {variant === 'hero' && (
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 20px,
              rgba(255, 255, 255, 0.1) 20px,
              rgba(255, 255, 255, 0.1) 40px
            )`
          }}
        />
      )}
    </header>
  );
};

export default BrandedHeader;