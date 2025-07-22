'use client';

import React, { useState } from 'react';
import { ImageData } from '@/types';

interface ImageDisplayProps {
  image: ImageData;
  className?: string;
  showCaption?: boolean;
  interactive?: boolean;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
  image,
  className = '',
  showCaption = true,
  interactive = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleImageClick = () => {
    if (interactive) {
      setIsExpanded(!isExpanded);
    }
  };

  const getSizeClasses = () => {
    const sizeMap = {
      'small': 'w-32 h-24',
      'medium': 'w-64 h-48',
      'large': 'w-96 h-72',
      'full-width': 'w-full h-64'
    };
    return sizeMap[image.size || 'medium'];
  };

  const getPlacementClasses = () => {
    const placementMap = {
      'inline': 'mx-auto my-4',
      'section-start': 'mb-6',
      'section-end': 'mt-6',
      'sidebar': 'float-right ml-4 mb-4'
    };
    return placementMap[image.placement || 'inline'];
  };

  if (hasError) {
    return (
      <div className={`
        ${getSizeClasses()} 
        ${getPlacementClasses()}
        ${className}
        bg-gray-100 border-2 border-dashed border-gray-300 
        flex items-center justify-center rounded-lg
      `}>
        <div className="text-center p-4">
          <div className="text-gray-400 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 font-sarabun">ไม่สามารถโหลดภาพได้</p>
          {showCaption && image.caption && (
            <p className="text-xs text-gray-400 mt-1">{image.caption}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`
      ${getPlacementClasses()}
      ${className}
      ${interactive ? 'cursor-pointer' : ''}
      ${isExpanded ? 'fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4' : ''}
    `}>
      <div className={`
        relative 
        ${isExpanded ? 'max-w-4xl max-h-screen' : getSizeClasses()}
        ${isExpanded ? '' : 'overflow-hidden rounded-lg shadow-lg'}
      `}>
        {isLoading && (
          <div className={`
            ${getSizeClasses()} 
            bg-gradient-to-r from-blue-50 to-blue-100 
            animate-pulse flex items-center justify-center rounded-lg
          `}>
            <div className="text-blue-500">
              <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        )}

        <img
          src={image.url}
          alt={image.alt}
          className={`
            ${isLoading ? 'opacity-0' : 'opacity-100'}
            ${isExpanded ? 'max-w-full max-h-full object-contain' : 'w-full h-full object-cover'}
            transition-opacity duration-300 rounded-lg
          `}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onClick={handleImageClick}
        />

        {interactive && !isExpanded && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {isExpanded && (
          <button
            onClick={handleImageClick}
            className="absolute top-4 right-4 bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showCaption && image.caption && !isExpanded && (
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600 font-sarabun leading-relaxed">
            {image.caption}
          </p>
          {image.source && (
            <p className="text-xs text-gray-400 mt-1 font-sarabun">
              แหล่งที่มา: {image.source}
            </p>
          )}
        </div>
      )}

      {/* Grade appropriateness indicator */}
      {image.gradeAppropriate && (
        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          ✓
        </div>
      )}
    </div>
  );
};

interface ImageGalleryProps {
  images: ImageData[];
  title?: string;
  className?: string;
  maxColumns?: number;
  showCaptions?: boolean;
  interactive?: boolean;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  title,
  className = '',
  maxColumns = 3,
  showCaptions = true,
  interactive = true
}) => {
  if (images.length === 0) {
    return null;
  }

  const getGridClasses = () => {
    const gridMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };
    return gridMap[maxColumns as keyof typeof gridMap] || gridMap[3];
  };

  return (
    <div className={`my-8 ${className}`}>
      {title && (
        <h3 className="text-lg font-kanit font-semibold text-blue-900 mb-4 border-b border-blue-200 pb-2">
          {title}
        </h3>
      )}
      
      <div className={`grid ${getGridClasses()} gap-6`}>
        {images.map((image) => (
          <ImageDisplay
            key={image.id}
            image={image}
            showCaption={showCaptions}
            interactive={interactive}
            className="transition-transform hover:scale-105"
          />
        ))}
      </div>
    </div>
  );
};

export default ImageDisplay;