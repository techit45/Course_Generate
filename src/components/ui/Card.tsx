import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
  variant?: 'default' | 'branded' | 'elevated';
}

export default function Card({ 
  children, 
  className = '', 
  gradient = false,
  variant = 'default' 
}: CardProps) {
  const baseClasses = "rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-4 sm:p-6 lg:p-8 transition-all duration-200";
  
  let variantClasses = '';
  
  if (gradient || variant === 'branded') {
    variantClasses = "bg-gradient-to-br from-white via-login-learning-50 to-login-learning-100 border border-login-learning-200";
  } else if (variant === 'elevated') {
    variantClasses = "bg-white border-0 shadow-xl";
  } else {
    variantClasses = "bg-white border border-gray-200 hover:border-login-learning-300 hover:shadow-lg";
  }
  
  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  );
}