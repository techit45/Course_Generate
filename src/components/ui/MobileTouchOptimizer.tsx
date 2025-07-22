'use client';

import React, { useEffect } from 'react';

// Mobile touch optimization component
// Improves touch interactions and prevents common mobile UI issues
export default function MobileTouchOptimizer() {
  useEffect(() => {
    // Prevent double-tap zoom on buttons and interactive elements
    const preventDoubleTabZoom = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('label')
      ) {
        e.preventDefault();
      }
    };

    // Improve touch responsiveness
    const improveTouchResponse = () => {
      const style = document.createElement('style');
      style.innerHTML = `
        /* Improve touch targets */
        button, [role="button"], input[type="submit"], input[type="button"] {
          min-height: 44px !important;
          min-width: 44px !important;
        }
        
        /* Remove tap highlight on iOS */
        * {
          -webkit-tap-highlight-color: transparent !important;
        }
        
        /* Prevent text selection on touch */
        .no-select {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        
        /* Improve scrolling on mobile */
        body {
          -webkit-overflow-scrolling: touch !important;
          overscroll-behavior-y: contain !important;
        }
        
        /* Fix sticky positioning on mobile */
        .mobile-sticky {
          position: -webkit-sticky !important;
          position: sticky !important;
        }
        
        /* Improve form input appearance on iOS */
        input, select, textarea {
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
          border-radius: 8px !important;
        }
        
        /* Prevent zoom on input focus (iOS) */
        input, select, textarea {
          font-size: 16px !important;
        }
        
        /* Better button touch feedback */
        button:active, [role="button"]:active {
          transform: scale(0.98) !important;
          transition: transform 0.1s ease-in-out !important;
        }
        
        /* Fix modal positioning on mobile */
        @media (max-width: 768px) {
          .modal-mobile {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            border-radius: 0 !important;
            margin: 0 !important;
          }
        }
        
        /* Improve card touch interaction */
        .card-mobile {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out !important;
        }
        
        .card-mobile:active {
          transform: translateY(1px) !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    };

    // Add mobile-specific classes
    const addMobileClasses = () => {
      if (typeof window !== 'undefined') {
        const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|opera mini|windows phone/i.test(
          navigator.userAgent.toLowerCase()
        );
        
        if (isMobile) {
          document.body.classList.add('mobile-device');
          
          // Add no-select class to non-interactive elements
          const elementsToOptimize = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span:not([role]), div:not([role])');
          elementsToOptimize.forEach(element => {
            element.classList.add('no-select');
          });
          
          // Add mobile-specific classes to cards
          const cards = document.querySelectorAll('[class*="Card"], .card');
          cards.forEach(card => {
            card.classList.add('card-mobile');
          });
        }
      }
    };

    // Viewport meta tag optimization
    const optimizeViewport = () => {
      let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        document.head.appendChild(viewportMeta);
      }
      
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, user-scalable=yes, viewport-fit=cover';
    };

    // Prevent iOS rubber band scrolling
    const preventRubberBand = (e: TouchEvent) => {
      const element = e.target as HTMLElement;
      const scrollableParent = element.closest('[style*="overflow"], [class*="scroll"], [class*="overflow"]');
      
      if (!scrollableParent) {
        const isAtTop = window.scrollY === 0;
        const isAtBottom = window.scrollY >= document.documentElement.scrollHeight - window.innerHeight;
        
        if ((isAtTop && e.touches[0].clientY > e.touches[0].clientY) || 
            (isAtBottom && e.touches[0].clientY < e.touches[0].clientY)) {
          e.preventDefault();
        }
      }
    };

    // Initialize optimizations
    const cleanupStyle = improveTouchResponse();
    optimizeViewport();
    
    // Add event listeners after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      addMobileClasses();
      
      // Add touch event listeners
      document.addEventListener('touchstart', preventDoubleTabZoom, { passive: false });
      document.addEventListener('touchmove', preventRubberBand, { passive: false });
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      cleanupStyle();
      document.removeEventListener('touchstart', preventDoubleTabZoom);
      document.removeEventListener('touchmove', preventRubberBand);
    };
  }, []);

  // This component doesn't render anything, it only applies optimizations
  return null;
}