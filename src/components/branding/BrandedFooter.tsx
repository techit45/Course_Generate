import React from 'react';
import LoginLearningLogo from './LoginLearningLogo';

interface BrandedFooterProps {
  variant?: 'full' | 'minimal';
  showLogo?: boolean;
  className?: string;
}

const BrandedFooter: React.FC<BrandedFooterProps> = ({
  variant = 'full',
  showLogo = true,
  className = ''
}) => {
  const currentYear = new Date().getFullYear();

  if (variant === 'minimal') {
    return (
      <footer className={`bg-login-learning-800 text-white py-4 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            {showLogo && (
              <div className="flex-shrink-0">
                <LoginLearningLogo 
                  variant="full"
                  size="sm"
                  color="white"
                />
              </div>
            )}
            
            <div className="text-center sm:text-right">
              <p className="text-sm text-login-learning-100">
                © {currentYear} Login-Learning. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`bg-gradient-to-br from-login-learning-800 to-login-learning-900 text-white ${className}`}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-4">
            {showLogo && (
              <LoginLearningLogo 
                variant="full"
                size="lg"
                color="white"
              />
            )}
            
            <p className="text-login-learning-200 text-sm leading-relaxed max-w-md">
              Login-Learning เป็นบริษัทเทคโนโลยีการศึกษาที่มุ่งเน้นการพัฒนาเครื่องมือและแพลตฟอร์มสำหรับการเรียนการสอนที่มีประสิทธิภาพและทันสมัย
            </p>
            
            <div className="flex items-center space-x-4 pt-4">
              <div className="w-8 h-1 bg-login-learning-500 rounded"></div>
              <span className="text-login-learning-300 text-xs font-medium tracking-wider">
                EDUCATIONAL TECHNOLOGY SOLUTIONS
              </span>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              ผลิตภัณฑ์
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-login-learning-200 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="w-2 h-2 bg-login-learning-500 rounded-full mr-3"></span>
                  Study Sheet Generator
                </a>
              </li>
              <li>
                <a href="#" className="text-login-learning-200 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="w-2 h-2 bg-login-learning-500 rounded-full mr-3"></span>
                  Learning Management System
                </a>
              </li>
              <li>
                <a href="#" className="text-login-learning-200 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="w-2 h-2 bg-login-learning-500 rounded-full mr-3"></span>
                  AI Teaching Assistant
                </a>
              </li>
              <li>
                <a href="#" className="text-login-learning-200 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="w-2 h-2 bg-login-learning-500 rounded-full mr-3"></span>
                  Educational Analytics
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              การสนับสนุน
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-login-learning-200 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="w-2 h-2 bg-login-learning-500 rounded-full mr-3"></span>
                  คู่มือการใช้งาน
                </a>
              </li>
              <li>
                <a href="#" className="text-login-learning-200 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="w-2 h-2 bg-login-learning-500 rounded-full mr-3"></span>
                  ติดต่อฝ่ายสนับสนุน
                </a>
              </li>
              <li>
                <a href="#" className="text-login-learning-200 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="w-2 h-2 bg-login-learning-500 rounded-full mr-3"></span>
                  คำถามที่พบบ่อย
                </a>
              </li>
              <li>
                <a href="#" className="text-login-learning-200 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="w-2 h-2 bg-login-learning-500 rounded-full mr-3"></span>
                  อัปเดตระบบ
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-login-learning-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-login-learning-200">
              <span>© {currentYear} Login-Learning Co., Ltd.</span>
              <a href="#" className="hover:text-white transition-colors duration-200">
                นโยบายความเป็นส่วนตัว
              </a>
              <a href="#" className="hover:text-white transition-colors duration-200">
                ข้อกำหนดการใช้งาน
              </a>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-xs text-login-learning-300">
                Powered by AI Technology
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-login-learning-200">
                  System Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle Brand Pattern */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, #3b82f6, #2563eb, #1d4ed8, #3b82f6)'
        }}
      />
    </footer>
  );
};

export default BrandedFooter;