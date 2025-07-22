import { 
  StudySheetContent, 
  ContentSection, 
  ImageData, 
  AnimationData, 
  EnhancedImageSuggestion,
  GeneratedDiagram,
  GradeLevel 
} from '@/types';

export interface ImagePlacementConfig {
  maxImagesPerSection: number;
  preferredPlacements: ImageData['placement'][];
  imageDistribution: {
    sectionStart: number; // percentage
    inline: number;
    sectionEnd: number;
    sidebar: number;
  };
  sizeDistribution: {
    small: number; // percentage
    medium: number;
    large: number;
    fullWidth: number;
  };
}

export interface PlacementResult {
  success: boolean;
  placedImages: ImageData[];
  placedDiagrams: AnimationData[];
  warnings: string[];
  metadata: {
    totalImages: number;
    totalDiagrams: number;
    averageImagesPerSection: number;
    placementStrategy: string;
  };
}

export class ImagePlacementService {
  private static readonly GRADE_PLACEMENT_CONFIG: Record<GradeLevel, ImagePlacementConfig> = {
    'ม.1': {
      maxImagesPerSection: 2,
      preferredPlacements: ['section-start', 'inline'],
      imageDistribution: { sectionStart: 40, inline: 50, sectionEnd: 10, sidebar: 0 },
      sizeDistribution: { small: 20, medium: 60, large: 20, fullWidth: 0 }
    },
    'ม.2': {
      maxImagesPerSection: 2,
      preferredPlacements: ['section-start', 'inline'],
      imageDistribution: { sectionStart: 35, inline: 55, sectionEnd: 10, sidebar: 0 },
      sizeDistribution: { small: 25, medium: 55, large: 20, fullWidth: 0 }
    },
    'ม.3': {
      maxImagesPerSection: 3,
      preferredPlacements: ['inline', 'section-start', 'section-end'],
      imageDistribution: { sectionStart: 30, inline: 50, sectionEnd: 15, sidebar: 5 },
      sizeDistribution: { small: 20, medium: 50, large: 25, fullWidth: 5 }
    },
    'ม.4': {
      maxImagesPerSection: 3,
      preferredPlacements: ['inline', 'section-start', 'sidebar'],
      imageDistribution: { sectionStart: 25, inline: 45, sectionEnd: 20, sidebar: 10 },
      sizeDistribution: { small: 15, medium: 45, large: 30, fullWidth: 10 }
    },
    'ม.5': {
      maxImagesPerSection: 4,
      preferredPlacements: ['inline', 'sidebar', 'section-start'],
      imageDistribution: { sectionStart: 20, inline: 40, sectionEnd: 25, sidebar: 15 },
      sizeDistribution: { small: 10, medium: 40, large: 35, fullWidth: 15 }
    },
    'ม.6': {
      maxImagesPerSection: 4,
      preferredPlacements: ['sidebar', 'inline', 'section-end'],
      imageDistribution: { sectionStart: 15, inline: 35, sectionEnd: 30, sidebar: 20 },
      sizeDistribution: { small: 10, medium: 35, large: 40, fullWidth: 15 }
    }
  };

  private static readonly SECTION_TYPE_IMAGE_PRIORITY = {
    'theory': { priority: 9, preferredTypes: ['diagram', 'illustration'], maxImages: 2 },
    'explanation': { priority: 8, preferredTypes: ['diagram', 'infographic'], maxImages: 3 },
    'example': { priority: 7, preferredTypes: ['photo', 'illustration'], maxImages: 2 },
    'practice': { priority: 6, preferredTypes: ['illustration', 'diagram'], maxImages: 1 },
    'summary': { priority: 5, preferredTypes: ['infographic', 'chart'], maxImages: 1 }
  };

  public static placeImagesInStudySheet(
    studySheetContent: StudySheetContent,
    imageSuggestions: EnhancedImageSuggestion[],
    diagrams: GeneratedDiagram[],
    gradeLevel: GradeLevel
  ): PlacementResult {
    const config = this.GRADE_PLACEMENT_CONFIG[gradeLevel];
    const warnings: string[] = [];
    const placedImages: ImageData[] = [];
    const placedDiagrams: AnimationData[] = [];

    try {
      // Step 1: Prioritize sections for image placement
      const prioritizedSections = this.prioritizeSections(studySheetContent.mainContent);

      // Step 2: Convert suggestions to ImageData
      const availableImages = this.convertSuggestionsToImageData(imageSuggestions);

      // Step 3: Convert diagrams to AnimationData
      const availableDiagrams = this.convertDiagramsToAnimationData(diagrams, gradeLevel);

      // Step 4: Place images strategically
      const imageResult = this.placeImagesInSections(
        prioritizedSections, 
        availableImages, 
        config
      );
      placedImages.push(...imageResult.images);
      warnings.push(...imageResult.warnings);

      // Step 5: Place diagrams
      const diagramResult = this.placeDiagramsInSections(
        prioritizedSections,
        availableDiagrams,
        config
      );
      placedDiagrams.push(...diagramResult.diagrams);
      warnings.push(...diagramResult.warnings);

      // Step 6: Update study sheet content with placed images
      this.updateStudySheetWithImages(studySheetContent, placedImages, placedDiagrams);

      return {
        success: true,
        placedImages,
        placedDiagrams,
        warnings,
        metadata: {
          totalImages: placedImages.length,
          totalDiagrams: placedDiagrams.length,
          averageImagesPerSection: placedImages.length / prioritizedSections.length,
          placementStrategy: this.determinePlacementStrategy(config)
        }
      };

    } catch (error) {
      console.error('Error placing images in study sheet:', error);
      return {
        success: false,
        placedImages: [],
        placedDiagrams: [],
        warnings: [`เกิดข้อผิดพลาดในการจัดวางภาพ: ${error}`],
        metadata: {
          totalImages: 0,
          totalDiagrams: 0,
          averageImagesPerSection: 0,
          placementStrategy: 'fallback'
        }
      };
    }
  }

  private static prioritizeSections(sections: ContentSection[]): ContentSection[] {
    return sections.sort((a, b) => {
      const priorityA = this.SECTION_TYPE_IMAGE_PRIORITY[a.type]?.priority || 0;
      const priorityB = this.SECTION_TYPE_IMAGE_PRIORITY[b.type]?.priority || 0;
      return priorityB - priorityA; // Higher priority first
    });
  }

  private static convertSuggestionsToImageData(suggestions: EnhancedImageSuggestion[]): ImageData[] {
    return suggestions.map((suggestion, index) => ({
      id: suggestion.id,
      url: `https://via.placeholder.com/400x300/1E40AF/FFFFFF?text=${encodeURIComponent(suggestion.title)}`,
      alt: suggestion.alternativeText,
      caption: suggestion.description,
      source: 'AI Generated Suggestion',
      placement: suggestion.placement,
      size: suggestion.size,
      gradeAppropriate: suggestion.ageAppropriate
    }));
  }

  private static convertDiagramsToAnimationData(
    diagrams: GeneratedDiagram[], 
    gradeLevel: GradeLevel
  ): AnimationData[] {
    return diagrams.map(diagram => ({
      id: diagram.id,
      type: diagram.type,
      title: diagram.title,
      description: diagram.description,
      data: {
        svgContent: diagram.svgContent,
        htmlContent: diagram.htmlContent,
        instructions: diagram.instructions,
        interactiveElements: diagram.interactiveElements
      },
      duration: this.estimateDiagramDuration(diagram.type, gradeLevel),
      complexity: this.determineDiagramComplexity(diagram.type, gradeLevel),
      gradeLevel
    }));
  }

  private static placeImagesInSections(
    sections: ContentSection[],
    images: ImageData[],
    config: ImagePlacementConfig
  ): { images: ImageData[], warnings: string[] } {
    const placedImages: ImageData[] = [];
    const warnings: string[] = [];
    let imageIndex = 0;

    sections.forEach((section, sectionIndex) => {
      const sectionPriority = this.SECTION_TYPE_IMAGE_PRIORITY[section.type];
      if (!sectionPriority) return;

      const maxImagesForSection = Math.min(
        config.maxImagesPerSection,
        sectionPriority.maxImages
      );

      const sectionImages: ImageData[] = [];
      let imagesPlacedInSection = 0;

      // Place images according to distribution strategy
      for (let i = 0; i < maxImagesForSection && imageIndex < images.length; i++) {
        const image = images[imageIndex];
        const placementType = this.determinePlacementForImage(
          imagesPlacedInSection,
          maxImagesForSection,
          config
        );

        const placedImage: ImageData = {
          ...image,
          placement: placementType,
          size: this.determineSizeForPlacement(placementType, config)
        };

        // Validate placement
        if (this.validateImagePlacement(placedImage, section, sectionImages)) {
          sectionImages.push(placedImage);
          placedImages.push(placedImage);
          imagesPlacedInSection++;
          imageIndex++;
        } else {
          warnings.push(`ไม่สามารถวางภาพ "${image.alt}" ในส่วน "${section.title}" ได้`);
          imageIndex++;
        }
      }

      // Add images to section
      if (!section.images) section.images = [];
      section.images.push(...sectionImages);
    });

    // Handle remaining images
    if (imageIndex < images.length) {
      warnings.push(`เหลือภาพที่ยังไม่ได้วาง ${images.length - imageIndex} ภาพ`);
    }

    return { images: placedImages, warnings };
  }

  private static placeDiagramsInSections(
    sections: ContentSection[],
    diagrams: AnimationData[],
    config: ImagePlacementConfig
  ): { diagrams: AnimationData[], warnings: string[] } {
    const placedDiagrams: AnimationData[] = [];
    const warnings: string[] = [];
    let diagramIndex = 0;

    // Focus on theory and explanation sections for diagrams
    const diagramSections = sections.filter(s => 
      s.type === 'theory' || s.type === 'explanation'
    );

    diagramSections.forEach(section => {
      if (diagramIndex >= diagrams.length) return;

      const diagram = diagrams[diagramIndex];
      
      // Add diagram to section
      if (!section.animations) section.animations = [];
      section.animations.push(diagram);
      
      placedDiagrams.push(diagram);
      diagramIndex++;
    });

    // Place remaining diagrams in other sections if appropriate
    if (diagramIndex < diagrams.length) {
      const remainingSections = sections.filter(s => 
        s.type !== 'theory' && s.type !== 'explanation' && s.type !== 'summary'
      );

      remainingSections.forEach(section => {
        if (diagramIndex >= diagrams.length) return;

        const diagram = diagrams[diagramIndex];
        if (!section.animations) section.animations = [];
        section.animations.push(diagram);
        
        placedDiagrams.push(diagram);
        diagramIndex++;
      });
    }

    if (diagramIndex < diagrams.length) {
      warnings.push(`เหลือแผนภาพที่ยังไม่ได้วาง ${diagrams.length - diagramIndex} แผนภาพ`);
    }

    return { diagrams: placedDiagrams, warnings };
  }

  private static determinePlacementForImage(
    currentImageCount: number,
    maxImages: number,
    config: ImagePlacementConfig
  ): ImageData['placement'] {
    // First image: section-start (if preferred)
    if (currentImageCount === 0 && config.preferredPlacements.includes('section-start')) {
      return 'section-start';
    }

    // Last image: section-end (if multiple images)
    if (currentImageCount === maxImages - 1 && maxImages > 1 && config.preferredPlacements.includes('section-end')) {
      return 'section-end';
    }

    // Middle images: inline or sidebar
    if (config.preferredPlacements.includes('inline')) {
      return 'inline';
    }

    return config.preferredPlacements[0] || 'inline';
  }

  private static determineSizeForPlacement(
    placement: ImageData['placement'],
    config: ImagePlacementConfig
  ): ImageData['size'] {
    switch (placement) {
      case 'section-start':
        return Math.random() < 0.7 ? 'large' : 'medium';
      case 'section-end':
        return Math.random() < 0.6 ? 'medium' : 'large';
      case 'sidebar':
        return Math.random() < 0.8 ? 'small' : 'medium';
      case 'inline':
      default:
        return Math.random() < 0.7 ? 'medium' : 'small';
    }
  }

  private static validateImagePlacement(
    image: ImageData,
    section: ContentSection,
    existingSectionImages: ImageData[]
  ): boolean {
    // Check if section already has images in the same placement
    const samePlacementCount = existingSectionImages.filter(
      img => img.placement === image.placement
    ).length;

    // Limit same placement types
    const maxSamePlacement = {
      'section-start': 1,
      'section-end': 1,
      'sidebar': 2,
      'inline': 3
    };

    if (samePlacementCount >= maxSamePlacement[image.placement || 'inline']) {
      return false;
    }

    // Check grade appropriateness
    if (!image.gradeAppropriate) {
      return false;
    }

    // Section-specific validation
    const sectionPriority = this.SECTION_TYPE_IMAGE_PRIORITY[section.type];
    if (!sectionPriority) {
      return false;
    }

    return true;
  }

  private static updateStudySheetWithImages(
    studySheetContent: StudySheetContent,
    placedImages: ImageData[],
    placedDiagrams: AnimationData[]
  ): void {
    // Update image suggestions in study sheet
    studySheetContent.images = studySheetContent.images || [];
    
    // Add metadata about placed images
    placedImages.forEach(image => {
      const suggestion = {
        id: image.id,
        description: image.caption || image.alt,
        keywords: [image.alt, 'placed-image']
      };
      
      if (!studySheetContent.images.some(img => img.id === suggestion.id)) {
        studySheetContent.images.push(suggestion);
      }
    });

    // Update metadata
    if (studySheetContent.metadata) {
      studySheetContent.metadata = {
        ...studySheetContent.metadata,
        totalImages: placedImages.length,
        totalDiagrams: placedDiagrams.length
      } as any;
    }
  }

  private static estimateDiagramDuration(diagramType: AnimationData['type'], gradeLevel: GradeLevel): number {
    const baseDurations = {
      'diagram': 5,
      'chart': 4,
      'timeline': 6,
      'process': 7,
      'concept-map': 8
    };

    const gradeMultipliers = {
      'ม.1': 1.5, 'ม.2': 1.4, 'ม.3': 1.2,
      'ม.4': 1.0, 'ม.5': 0.9, 'ม.6': 0.8
    };

    const baseDuration = baseDurations[diagramType] || 5;
    const multiplier = gradeMultipliers[gradeLevel] || 1.0;

    return Math.round(baseDuration * multiplier);
  }

  private static determineDiagramComplexity(
    diagramType: AnimationData['type'], 
    gradeLevel: GradeLevel
  ): AnimationData['complexity'] {
    const complexityMap = {
      'ม.1': 'simple', 'ม.2': 'simple', 'ม.3': 'moderate',
      'ม.4': 'moderate', 'ม.5': 'complex', 'ม.6': 'complex'
    };

    return complexityMap[gradeLevel] as AnimationData['complexity'];
  }

  private static determinePlacementStrategy(config: ImagePlacementConfig): string {
    const dominant = Object.entries(config.imageDistribution)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    return `${dominant}-focused`;
  }

  // Utility method to get placement recommendations
  public static getPlacementRecommendations(
    gradeLevel: GradeLevel,
    sectionType: ContentSection['type']
  ): {
    recommendedPlacements: ImageData['placement'][],
    maxImages: number,
    preferredSizes: ImageData['size'][],
    tips: string[]
  } {
    const config = this.GRADE_PLACEMENT_CONFIG[gradeLevel];
    const sectionPriority = this.SECTION_TYPE_IMAGE_PRIORITY[sectionType];

    return {
      recommendedPlacements: config.preferredPlacements,
      maxImages: sectionPriority?.maxImages || 1,
      preferredSizes: this.getPreferredSizes(config),
      tips: this.getPlacementTips(gradeLevel, sectionType)
    };
  }

  private static getPreferredSizes(config: ImagePlacementConfig): ImageData['size'][] {
    return Object.entries(config.sizeDistribution)
      .sort(([,a], [,b]) => b - a)
      .map(([size]) => size as ImageData['size']);
  }

  private static getPlacementTips(gradeLevel: GradeLevel, sectionType: ContentSection['type']): string[] {
    const tips: string[] = [];

    if (gradeLevel === 'ม.1' || gradeLevel === 'ม.2') {
      tips.push('ใช้ภาพง่ายๆ ที่เข้าใจง่าย');
      tips.push('หลีกเลี่ยงภาพที่มีรายละเอียดมากเกินไป');
    } else if (gradeLevel === 'ม.5' || gradeLevel === 'ม.6') {
      tips.push('สามารถใช้ภาพที่มีความซับซ้อนมากขึ้น');
      tips.push('เน้นภาพที่ต้องใช้การวิเคราะห์');
    }

    if (sectionType === 'theory') {
      tips.push('ใช้แผนภาพและภาพประกอบแนวคิด');
    } else if (sectionType === 'example') {
      tips.push('ใช้ภาพตัวอย่างจริงจากชีวิตประจำวัน');
    }

    return tips;
  }
}

export default ImagePlacementService;