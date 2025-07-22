import {
  WebExportOptions,
  WebThemeOptions,
  ResponsiveBreakpoints,
  WebLayoutSection,
  InteractiveFeature,
  WebAnimation
} from '@/types';

// Login-Learning Web Theme
export const LOGIN_LEARNING_WEB_THEME: WebThemeOptions = {
  primaryColor: '#1E40AF',      // Blue-800
  secondaryColor: '#3B82F6',    // Blue-500
  fontFamily: 'Kanit, Sarabun, sans-serif',
  fontSize: {
    base: 16,
    heading: 24,
    small: 14
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 32
  },
  borderRadius: 8,
  shadows: true,
  animations: {
    enabled: true,
    duration: 300,
    easing: 'ease-in-out'
  }
};

// Default Web Export Options
export const DEFAULT_WEB_OPTIONS: WebExportOptions = {
  includeAnimations: true,
  includeInteractivity: true,
  responsiveBreakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
    largeDesktop: 1536
  },
  navigationStyle: 'sidebar',
  printFriendly: true,
  darkModeSupport: false,
  accessibilityFeatures: true,
  shareableUrl: true
};

// Web Layout Sections Configuration
export const WEB_LAYOUT_SECTIONS: WebLayoutSection[] = [
  {
    id: 'hero',
    type: 'hero',
    title: 'Hero Section',
    visible: true,
    animated: true,
    interactive: false,
    order: 1
  },
  {
    id: 'objectives',
    type: 'objectives',
    title: 'วัตถุประสงค์การเรียนรู้',
    visible: true,
    animated: true,
    interactive: true,
    order: 2
  },
  {
    id: 'content',
    type: 'content',
    title: 'เนื้อหาหลัก',
    visible: true,
    animated: true,
    interactive: true,
    order: 3
  },
  {
    id: 'activities',
    type: 'activities',
    title: 'กิจกรรมการเรียนรู้',
    visible: true,
    animated: true,
    interactive: true,
    order: 4
  },
  {
    id: 'exercises',
    type: 'exercises',
    title: 'แบบฝึกหัด',
    visible: true,
    animated: true,
    interactive: true,
    order: 5
  },
  {
    id: 'summary',
    type: 'summary',
    title: 'สรุป',
    visible: true,
    animated: true,
    interactive: false,
    order: 6
  },
  {
    id: 'footer',
    type: 'footer',
    title: 'Footer',
    visible: true,
    animated: false,
    interactive: false,
    order: 7
  }
];

// Interactive Features Configuration
export const INTERACTIVE_FEATURES: InteractiveFeature[] = [
  {
    id: 'objective-tooltips',
    type: 'tooltip',
    trigger: 'hover',
    target: '.objective-item',
    content: 'คลิกเพื่อดูรายละเอียดเพิ่มเติม',
    animation: 'fade',
    duration: 200
  },
  {
    id: 'content-sections',
    type: 'collapse',
    trigger: 'click',
    target: '.content-section-header',
    content: 'expandable-content',
    animation: 'slide',
    duration: 300
  },
  {
    id: 'exercise-modal',
    type: 'modal',
    trigger: 'click',
    target: '.exercise-item',
    content: 'exercise-detail-modal',
    animation: 'scale',
    duration: 250
  },
  {
    id: 'progress-tracker',
    type: 'progress-tracker',
    trigger: 'scroll',
    target: 'body',
    content: 'reading-progress',
    animation: 'pulse',
    duration: 100
  }
];

// Web Animations Configuration
export const WEB_ANIMATIONS: WebAnimation[] = [
  {
    id: 'hero-fade-in',
    name: 'Hero Fade In',
    type: 'fade',
    duration: 800,
    delay: 200,
    easing: 'ease-out',
    trigger: 'load',
    target: '.hero-section'
  },
  {
    id: 'section-slide-up',
    name: 'Section Slide Up',
    type: 'slide',
    duration: 600,
    delay: 0,
    easing: 'ease-out',
    trigger: 'scroll',
    target: '.content-section'
  },
  {
    id: 'card-hover-scale',
    name: 'Card Hover Scale',
    type: 'scale',
    duration: 200,
    easing: 'ease-in-out',
    trigger: 'hover',
    target: '.interactive-card'
  },
  {
    id: 'objective-bounce',
    name: 'Objective Bounce',
    type: 'bounce',
    duration: 400,
    delay: 100,
    easing: 'ease-out',
    trigger: 'scroll',
    target: '.objective-item'
  }
];

// CSS Template for Web Export
export const WEB_CSS_TEMPLATE = `
/* Login Learning Web Export Styles */
:root {
  --primary-color: {{PRIMARY_COLOR}};
  --secondary-color: {{SECONDARY_COLOR}};
  --text-color: #1F2937;
  --background-color: #FFFFFF;
  --border-color: #E5E7EB;
  --accent-color: #F3F4F6;
  --success-color: #10B981;
  --warning-color: #F59E0B;
  --error-color: #EF4444;
  
  --font-family: {{FONT_FAMILY}};
  --font-size-base: {{FONT_SIZE_BASE}}px;
  --font-size-heading: {{FONT_SIZE_HEADING}}px;
  --font-size-small: {{FONT_SIZE_SMALL}}px;
  
  --spacing-small: {{SPACING_SMALL}}px;
  --spacing-medium: {{SPACING_MEDIUM}}px;
  --spacing-large: {{SPACING_LARGE}}px;
  
  --border-radius: {{BORDER_RADIUS}}px;
  --animation-duration: {{ANIMATION_DURATION}}ms;
  --animation-easing: {{ANIMATION_EASING}};
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--background-color);
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-medium);
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  padding: var(--spacing-large) 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: var(--spacing-medium);
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s ease-out 0.2s forwards;
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: var(--spacing-large);
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s ease-out 0.4s forwards;
}

.hero-metadata {
  display: flex;
  justify-content: center;
  gap: var(--spacing-large);
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s ease-out 0.6s forwards;
}

.metadata-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
  background: rgba(255, 255, 255, 0.1);
  padding: var(--spacing-small) var(--spacing-medium);
  border-radius: var(--border-radius);
  backdrop-filter: blur(10px);
}

/* Navigation */
.navigation {
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
  padding: var(--spacing-medium) 0;
}

.nav-links {
  display: flex;
  justify-content: center;
  gap: var(--spacing-large);
  list-style: none;
}

.nav-link {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  padding: var(--spacing-small) var(--spacing-medium);
  border-radius: var(--border-radius);
  transition: all var(--animation-duration) var(--animation-easing);
  position: relative;
}

.nav-link:hover {
  color: var(--primary-color);
  background: var(--accent-color);
}

.nav-link.active {
  color: var(--primary-color);
  background: rgba(30, 64, 175, 0.1);
}

/* Content Sections */
.content-section {
  padding: var(--spacing-large) 0;
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.6s ease-out;
}

.content-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-large);
}

.section-title {
  font-size: var(--font-size-heading);
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: var(--spacing-medium);
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  background: var(--secondary-color);
  margin: var(--spacing-medium) auto 0;
  border-radius: var(--border-radius);
}

/* Interactive Cards */
.interactive-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-large);
  margin-bottom: var(--spacing-medium);
  transition: all var(--animation-duration) var(--animation-easing);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.interactive-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
}

.interactive-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-color: var(--secondary-color);
}

.interactive-card:hover::before {
  left: 100%;
}

/* Objectives */
.objectives-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-medium);
  margin-top: var(--spacing-large);
}

.objective-item {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-large);
  transition: all var(--animation-duration) var(--animation-easing);
  position: relative;
}

.objective-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(30, 64, 175, 0.1);
}

.objective-number {
  position: absolute;
  top: -10px;
  left: var(--spacing-medium);
  background: var(--primary-color);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-large);
  margin-top: var(--spacing-large);
}

.content-item {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all var(--animation-duration) var(--animation-easing);
}

.content-item:hover {
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.content-header {
  background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: var(--spacing-medium) var(--spacing-large);
  cursor: pointer;
  display: flex;
  justify-content: between;
  align-items: center;
}

.content-body {
  padding: var(--spacing-large);
  display: none;
}

.content-body.expanded {
  display: block;
  animation: slideDown 0.3s ease-out;
}

/* Exercises */
.exercise-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-medium);
  margin-top: var(--spacing-large);
}

.exercise-item {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-large);
  transition: all var(--animation-duration) var(--animation-easing);
  cursor: pointer;
}

.exercise-item:hover {
  border-color: var(--secondary-color);
  transform: translateY(-2px);
}

/* Progress Tracker */
.progress-tracker {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--accent-color);
  z-index: 9999;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  width: 0%;
  transition: width 0.1s ease;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -10px, 0);
  }
  70% {
    transform: translate3d(0, -5px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-metadata {
    flex-direction: column;
    gap: var(--spacing-medium);
  }
  
  .nav-links {
    flex-direction: column;
    gap: var(--spacing-small);
  }
  
  .objectives-grid,
  .content-grid,
  .exercise-grid {
    grid-template-columns: 1fr;
  }
  
  .container {
    padding: 0 var(--spacing-small);
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.5rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .interactive-card,
  .objective-item,
  .exercise-item {
    padding: var(--spacing-medium);
  }
}

/* Print Styles */
@media print {
  .navigation,
  .progress-tracker {
    display: none;
  }
  
  .interactive-card,
  .content-item {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid var(--border-color);
  }
  
  .hero-section {
    background: white !important;
    color: var(--text-color) !important;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  :root {
    --text-color: #F9FAFB;
    --background-color: #111827;
    --border-color: #374151;
    --accent-color: #1F2937;
  }
  
  .interactive-card,
  .objective-item,
  .exercise-item,
  .content-item {
    background: #1F2937;
    border-color: #374151;
  }
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.focus-visible {
  outline: 2px solid var(--secondary-color);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

// JavaScript Template for Web Export
export const WEB_JS_TEMPLATE = `
// Login Learning Web Export Interactive Features
class StudySheetWebExport {
  constructor() {
    this.initializeAnimations();
    this.initializeInteractivity();
    this.initializeProgressTracker();
    this.initializeNavigation();
  }

  initializeAnimations() {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all content sections
    document.querySelectorAll('.content-section').forEach(section => {
      observer.observe(section);
    });

    // Staggered animations for objective items
    document.querySelectorAll('.objective-item').forEach((item, index) => {
      item.style.animationDelay = \`\${index * 0.1}s\`;
      item.classList.add('animate-bounce-in');
    });
  }

  initializeInteractivity() {
    // Collapsible content sections
    document.querySelectorAll('.content-header').forEach(header => {
      header.addEventListener('click', () => {
        const body = header.nextElementSibling;
        const isExpanded = body.classList.contains('expanded');
        
        // Close all other sections
        document.querySelectorAll('.content-body').forEach(b => {
          b.classList.remove('expanded');
        });
        
        // Toggle current section
        if (!isExpanded) {
          body.classList.add('expanded');
        }
        
        // Update icon
        const icon = header.querySelector('.expand-icon');
        if (icon) {
          icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        }
      });
    });

    // Exercise modals
    document.querySelectorAll('.exercise-item').forEach(item => {
      item.addEventListener('click', () => {
        const exerciseId = item.dataset.exerciseId;
        this.showExerciseModal(exerciseId);
      });
    });

    // Tooltip functionality
    document.querySelectorAll('[data-tooltip]').forEach(element => {
      element.addEventListener('mouseenter', (e) => {
        this.showTooltip(e.target, e.target.dataset.tooltip);
      });
      
      element.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });
    });
  }

  initializeProgressTracker() {
    const progressBar = document.querySelector('.progress-bar');
    if (!progressBar) return;

    const updateProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      progressBar.style.width = scrollPercent + '%';
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress(); // Initial call
  }

  initializeNavigation() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update active link
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    });

    // Update active link on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const updateActiveLink = () => {
      const scrollY = window.pageYOffset;
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
              link.classList.add('active');
            }
          });
        }
      });
    };

    window.addEventListener('scroll', updateActiveLink);
  }

  showExerciseModal(exerciseId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = \`
      <div class="modal-content">
        <div class="modal-header">
          <h3>แบบฝึกหัดข้อที่ \${exerciseId}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>เนื้อหาแบบฝึกหัดจะแสดงที่นี่</p>
        </div>
      </div>
    \`;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    // Add modal styles
    modal.style.cssText = \`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    \`;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = \`
      background: white;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      max-height: 80%;
      overflow-y: auto;
      animation: scaleIn 0.3s ease;
    \`;
  }

  showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    
    tooltip.style.cssText = \`
      position: absolute;
      background: #333;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 1000;
      pointer-events: none;
      animation: fadeIn 0.2s ease;
    \`;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
    
    this.currentTooltip = tooltip;
  }

  hideTooltip() {
    if (this.currentTooltip) {
      this.currentTooltip.remove();
      this.currentTooltip = null;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new StudySheetWebExport();
});

// Add required CSS animations
const style = document.createElement('style');
style.textContent = \`
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  .animate-bounce-in {
    animation: bounce 0.6s ease-out;
  }
\`;
document.head.appendChild(style);
`;

export default {
  LOGIN_LEARNING_WEB_THEME,
  DEFAULT_WEB_OPTIONS,
  WEB_LAYOUT_SECTIONS,
  INTERACTIVE_FEATURES,
  WEB_ANIMATIONS,
  WEB_CSS_TEMPLATE,
  WEB_JS_TEMPLATE
};