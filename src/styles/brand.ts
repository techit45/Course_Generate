// Login-Learning Brand System
// Comprehensive brand colors, typography, and styling configurations

export const LoginLearningBrand = {
  // Primary Brand Colors - Professional Blue Palette
  colors: {
    primary: {
      50: '#eff6ff',   // Very light blue
      100: '#dbeafe',  // Light blue
      200: '#bfdbfe',  // Lighter blue
      300: '#93c5fd',  // Medium light blue
      400: '#60a5fa',  // Medium blue
      500: '#3b82f6',  // Main brand blue
      600: '#2563eb',  // Dark blue (primary)
      700: '#1d4ed8',  // Darker blue
      800: '#1e40af',  // Very dark blue
      900: '#1e3a8a',  // Darkest blue
    },
    
    // Secondary Colors
    secondary: {
      50: '#f0f9ff',   // Sky blue light
      100: '#e0f2fe',  // Sky blue
      200: '#bae6fd',  // Light sky
      300: '#7dd3fc',  // Medium sky
      400: '#38bdf8',  // Bright sky
      500: '#0ea5e9',  // Sky blue
      600: '#0284c7',  // Dark sky
      700: '#0369a1',  // Darker sky
      800: '#075985',  // Very dark sky
      900: '#0c4a6e',  // Darkest sky
    },
    
    // Success Colors (Green)
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    // Warning Colors (Amber)
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    // Error Colors (Red)
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    
    // Neutral Colors (Gray)
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  },
  
  // Typography System
  typography: {
    fontFamily: {
      primary: ['Inter', 'system-ui', 'sans-serif'],
      heading: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
      thai: ['Noto Sans Thai', 'Inter', 'system-ui', 'sans-serif']
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
    },
    
    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    }
  },
  
  // Spacing System
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
    '5xl': '8rem',   // 128px
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  // Shadow System
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    brand: '0 4px 14px 0 rgb(59 130 246 / 0.15)', // Blue branded shadow
  },
  
  // Component Variants
  components: {
    // Button Variants
    button: {
      primary: {
        bg: 'bg-login-learning-600 hover:bg-login-learning-700',
        text: 'text-white',
        border: 'border-transparent',
        shadow: 'shadow-md hover:shadow-lg',
        focus: 'focus:ring-2 focus:ring-login-learning-500 focus:ring-offset-2'
      },
      secondary: {
        bg: 'bg-login-learning-100 hover:bg-login-learning-200',
        text: 'text-login-learning-700',
        border: 'border-login-learning-200',
        shadow: 'shadow-sm hover:shadow-md',
        focus: 'focus:ring-2 focus:ring-login-learning-500 focus:ring-offset-2'
      },
      outline: {
        bg: 'bg-transparent hover:bg-login-learning-50',
        text: 'text-login-learning-600 hover:text-login-learning-700',
        border: 'border-login-learning-300 hover:border-login-learning-400',
        shadow: 'hover:shadow-sm',
        focus: 'focus:ring-2 focus:ring-login-learning-500 focus:ring-offset-2'
      }
    },
    
    // Card Variants
    card: {
      default: {
        bg: 'bg-white',
        border: 'border border-gray-200',
        shadow: 'shadow-md',
        radius: 'rounded-xl'
      },
      branded: {
        bg: 'bg-gradient-to-br from-white to-login-learning-50',
        border: 'border border-login-learning-100',
        shadow: 'shadow-lg',
        radius: 'rounded-xl'
      },
      elevated: {
        bg: 'bg-white',
        border: 'border-0',
        shadow: 'shadow-xl',
        radius: 'rounded-2xl'
      }
    },
    
    // Input Variants
    input: {
      default: {
        bg: 'bg-white',
        border: 'border-gray-300 focus:border-login-learning-500',
        text: 'text-gray-900',
        placeholder: 'placeholder-gray-500',
        focus: 'focus:ring-2 focus:ring-login-learning-500',
        radius: 'rounded-lg'
      },
      branded: {
        bg: 'bg-login-learning-50',
        border: 'border-login-learning-200 focus:border-login-learning-500',
        text: 'text-login-learning-900',
        placeholder: 'placeholder-login-learning-400',
        focus: 'focus:ring-2 focus:ring-login-learning-500',
        radius: 'rounded-lg'
      }
    }
  },
  
  // Brand Gradients
  gradients: {
    primary: 'bg-gradient-to-r from-login-learning-600 to-login-learning-700',
    secondary: 'bg-gradient-to-r from-login-learning-500 to-blue-600',
    subtle: 'bg-gradient-to-br from-login-learning-50 to-blue-50',
    hero: 'bg-gradient-to-br from-login-learning-600 via-blue-600 to-login-learning-700',
    background: 'bg-gradient-to-br from-login-learning-50 to-login-learning-100'
  },
  
  // Brand Patterns
  patterns: {
    watermark: {
      opacity: '0.05',
      pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(59, 130, 246, 0.05) 10px, rgba(59, 130, 246, 0.05) 20px)'
    }
  }
};

// Utility functions for brand consistency
export const getBrandColor = (colorName: string, shade: number = 500) => {
  return (LoginLearningBrand.colors[colorName as keyof typeof LoginLearningBrand.colors] as any)?.[shade] || LoginLearningBrand.colors.primary[500];
};

export const getBrandGradient = (gradientName: keyof typeof LoginLearningBrand.gradients) => {
  return LoginLearningBrand.gradients[gradientName];
};

export const getBrandComponent = (componentName: string, variant: string = 'default') => {
  return (LoginLearningBrand.components[componentName as keyof typeof LoginLearningBrand.components] as any)?.[variant];
};

// CSS Custom Properties for Login-Learning Brand
export const brandCSSVariables = `
  :root {
    --ll-primary-50: #eff6ff;
    --ll-primary-100: #dbeafe;
    --ll-primary-200: #bfdbfe;
    --ll-primary-300: #93c5fd;
    --ll-primary-400: #60a5fa;
    --ll-primary-500: #3b82f6;
    --ll-primary-600: #2563eb;
    --ll-primary-700: #1d4ed8;
    --ll-primary-800: #1e40af;
    --ll-primary-900: #1e3a8a;
    
    --ll-gradient-primary: linear-gradient(to right, var(--ll-primary-600), var(--ll-primary-700));
    --ll-gradient-bg: linear-gradient(to bottom right, var(--ll-primary-50), var(--ll-primary-100));
    --ll-shadow-brand: 0 4px 14px 0 rgba(59, 130, 246, 0.15);
    
    --ll-font-primary: 'Inter', system-ui, sans-serif;
    --ll-font-thai: 'Noto Sans Thai', 'Inter', system-ui, sans-serif;
  }
`;

export default LoginLearningBrand;