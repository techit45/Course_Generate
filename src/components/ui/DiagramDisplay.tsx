'use client';

import React, { useState, useEffect } from 'react';
import { AnimationData, InteractiveElement } from '@/types';

interface DiagramDisplayProps {
  diagram: AnimationData;
  className?: string;
  showTitle?: boolean;
  showInstructions?: boolean;
  interactive?: boolean;
}

export const DiagramDisplay: React.FC<DiagramDisplayProps> = ({
  diagram,
  className = '',
  showTitle = true,
  showInstructions = true,
  interactive = true
}) => {
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleElementInteraction = (elementId: string, action: string) => {
    if (!interactive) return;

    switch (action) {
      case 'highlight':
        setActiveElement(activeElement === elementId ? null : elementId);
        break;
      case 'expand':
        setActiveElement(elementId);
        break;
      case 'show-details':
        setActiveElement(elementId);
        break;
      case 'show-value':
        setActiveElement(elementId);
        break;
    }
  };

  const getDiagramTypeIcon = () => {
    const iconMap = {
      'diagram': '📊',
      'chart': '📈',
      'timeline': '⏰',
      'process': '🔄',
      'concept-map': '🧠'
    };
    return iconMap[diagram.type] || '📋';
  };

  const getComplexityColor = () => {
    const colorMap = {
      'simple': 'text-green-600 bg-green-100',
      'moderate': 'text-yellow-600 bg-yellow-100',
      'complex': 'text-red-600 bg-red-100'
    };
    return colorMap[diagram.complexity];
  };

  const renderSVGContent = () => {
    if (diagram.data?.svgContent) {
      return (
        <div 
          className="w-full"
          dangerouslySetInnerHTML={{ __html: diagram.data.svgContent }}
        />
      );
    }

    if (diagram.data?.htmlContent) {
      return (
        <div 
          className="w-full"
          dangerouslySetInnerHTML={{ __html: diagram.data.htmlContent }}
        />
      );
    }

    // Fallback placeholder
    return (
      <div className="w-full h-64 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-dashed border-blue-300 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">{getDiagramTypeIcon()}</div>
          <h3 className="text-lg font-kanit font-semibold text-blue-900 mb-2">
            {diagram.title}
          </h3>
          <p className="text-sm text-blue-600 font-sarabun">
            {diagram.description}
          </p>
        </div>
      </div>
    );
  };

  const renderInteractiveElements = () => {
    if (!interactive || !diagram.data?.interactiveElements) return null;

    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-kanit font-semibold text-blue-900 mb-2">
          การใช้งานแบบโต้ตอบ:
        </h4>
        <div className="space-y-2">
          {diagram.data.interactiveElements.map((element: InteractiveElement) => (
            <div
              key={element.id}
              className={`
                text-xs font-sarabun p-2 rounded cursor-pointer transition-colors
                ${activeElement === element.id 
                  ? 'bg-blue-200 text-blue-900' 
                  : 'bg-white text-blue-700 hover:bg-blue-100'
                }
              `}
              onClick={() => handleElementInteraction(element.id, element.action)}
            >
              <span className="font-semibold">{element.trigger}:</span> {element.description}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderInstructions = () => {
    if (!showInstructions || !diagram.data?.instructions) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-kanit font-semibold text-gray-900 mb-2">
          คำแนะนำการใช้งาน:
        </h4>
        <ol className="space-y-1">
          {diagram.data.instructions.map((instruction: string, index: number) => (
            <li key={index} className="text-sm font-sarabun text-gray-700 flex items-start">
              <span className="inline-block w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex-shrink-0 mr-2 flex items-center justify-center mt-0.5">
                {index + 1}
              </span>
              {instruction}
            </li>
          ))}
        </ol>
      </div>
    );
  };

  return (
    <div className={`
      my-6 p-4 border border-gray-200 rounded-lg shadow-sm bg-white
      ${isFullscreen ? 'fixed inset-4 z-50 overflow-auto' : ''}
      ${className}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getDiagramTypeIcon()}</div>
          {showTitle && (
            <div>
              <h3 className="text-lg font-kanit font-semibold text-gray-900">
                {diagram.title}
              </h3>
              <p className="text-sm font-sarabun text-gray-600">
                {diagram.description}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Complexity indicator */}
          <span className={`
            px-2 py-1 rounded-full text-xs font-sarabun font-medium
            ${getComplexityColor()}
          `}>
            {diagram.complexity === 'simple' ? 'ง่าย' : 
             diagram.complexity === 'moderate' ? 'ปานกลาง' : 'ซับซ้อน'}
          </span>

          {/* Grade level indicator */}
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-sarabun font-medium">
            {diagram.gradeLevel}
          </span>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title={isFullscreen ? "ออกจากเต็มจอ" : "ดูแบบเต็มจอ"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Diagram content */}
      <div className="mb-4">
        {renderSVGContent()}
      </div>

      {/* Duration info */}
      {diagram.duration && (
        <div className="mb-4 text-sm font-sarabun text-gray-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          เวลาในการศึกษา: {diagram.duration} นาที
        </div>
      )}

      {/* Interactive elements */}
      {renderInteractiveElements()}

      {/* Instructions */}
      {renderInstructions()}

      {/* Close button for fullscreen */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

interface DiagramGalleryProps {
  diagrams: AnimationData[];
  title?: string;
  className?: string;
  showTitles?: boolean;
  showInstructions?: boolean;
  interactive?: boolean;
}

export const DiagramGallery: React.FC<DiagramGalleryProps> = ({
  diagrams,
  title,
  className = '',
  showTitles = true,
  showInstructions = true,
  interactive = true
}) => {
  if (diagrams.length === 0) {
    return null;
  }

  return (
    <div className={`my-8 ${className}`}>
      {title && (
        <h3 className="text-xl font-kanit font-semibold text-blue-900 mb-6 border-b-2 border-blue-200 pb-2">
          {title}
        </h3>
      )}
      
      <div className="space-y-8">
        {diagrams.map((diagram) => (
          <DiagramDisplay
            key={diagram.id}
            diagram={diagram}
            showTitle={showTitles}
            showInstructions={showInstructions}
            interactive={interactive}
          />
        ))}
      </div>
    </div>
  );
};

export default DiagramDisplay;