/**
 * Accessibility Manager - Handles accessibility features and screen reader support
 * @module utils/Accessibility
 */

export class AccessibilityManager {
  private liveRegion: HTMLElement | null = null;
  private focusTraps: Set<HTMLElement> = new Set();

  constructor() {
    this.initialize();
  }

  /**
   * Initialize accessibility features
   */
  private initialize(): void {
    // Create live region for announcements if it doesn't exist
    this.liveRegion = document.getElementById('sr-announcer');
    if (!this.liveRegion) {
      this.liveRegion = document.createElement('div');
      this.liveRegion.id = 'sr-announcer';
      this.liveRegion.setAttribute('aria-live', 'polite');
      this.liveRegion.setAttribute('aria-atomic', 'true');
      this.liveRegion.style.position = 'absolute';
      this.liveRegion.style.left = '-10000px';
      this.liveRegion.style.width = '1px';
      this.liveRegion.style.height = '1px';
      this.liveRegion.style.overflow = 'hidden';
      document.body.appendChild(this.liveRegion);
    }

    // Setup keyboard navigation
    this.setupKeyboardNavigation();

    // Setup focus management
    this.setupFocusManagement();
  }

  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return;

    // Clear previous content
    this.liveRegion.textContent = '';

    // Set priority
    this.liveRegion.setAttribute('aria-live', priority);

    // Announce new message
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = message;
      }
    }, 100);
  }

  /**
   * Setup keyboard navigation
   */
  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (event) => {
      // Skip to main content (Ctrl/Cmd + Home)
      if ((event.ctrlKey || event.metaKey) && event.key === 'Home') {
        event.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus();
          this.announce('Skipped to main content');
        }
      }

      // Escape key handling
      if (event.key === 'Escape') {
        this.handleEscapeKey();
      }
    });
  }

  /**
   * Setup focus management
   */
  private setupFocusManagement(): void {
    // Focus trap for modals (if any)
    // Focus management for dynamic content

    // Ensure all interactive elements are keyboard accessible
    this.ensureKeyboardAccessibility();
  }

  /**
   * Handle escape key
   */
  private handleEscapeKey(): void {
    // Close any open modals, menus, etc.
    // For now, just announce
    this.announce('Escape key pressed');
  }

  /**
   * Ensure all interactive elements are keyboard accessible
   */
  private ensureKeyboardAccessibility(): void {
    // Add tabindex and ARIA labels where needed
    const interactiveElements = document.querySelectorAll('button, input, select, textarea, [tabindex]');

    interactiveElements.forEach((element) => {
      const el = element as HTMLElement;

      // Ensure tabindex is appropriate
      if (!el.hasAttribute('tabindex') && !el.matches('button, input, select, textarea')) {
        // Only add tabindex if it's not already focusable
        if (getComputedStyle(el).cursor === 'pointer' || el.onclick) {
          el.setAttribute('tabindex', '0');
        }
      }

      // Ensure ARIA labels
      if (!el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby') && !el.textContent?.trim()) {
        // Add generic label for icon buttons
        if (el.matches('button') && el.querySelector('svg, .icon')) {
          el.setAttribute('aria-label', 'Button');
        }
      }
    });
  }

  /**
   * Create focus trap for modal dialogs
   */
  createFocusTrap(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    this.focusTraps.add(container);

    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      this.focusTraps.delete(container);
    };
  }

  /**
   * Set up ARIA live regions for dynamic content
   */
  setupLiveRegion(element: HTMLElement, priority: 'polite' | 'assertive' = 'polite'): void {
    element.setAttribute('aria-live', priority);
    element.setAttribute('aria-atomic', 'true');
  }

  /**
   * Update ARIA attributes for dynamic content
   */
  updateAriaAttributes(element: HTMLElement, attributes: Record<string, string>): void {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  /**
   * Check if the application is being used with a screen reader
   */
  isScreenReaderActive(): boolean {
    // This is a heuristic - not 100% reliable
    const hasSrFlag = navigator.userAgent.includes('NVDA') ||
                      navigator.userAgent.includes('JAWS') ||
                      navigator.userAgent.includes('VoiceOver') ||
                      window.speechSynthesis !== undefined;

    return hasSrFlag;
  }

  /**
   * Provide haptic feedback (if supported)
   */
  provideHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 50,
        medium: 100,
        heavy: 200
      };
      navigator.vibrate(patterns[type]);
    }
  }

  /**
   * Get current focus context
   */
  getFocusContext(): {
    activeElement: Element | null;
    isInMainContent: boolean;
    focusableElements: Element[];
  } {
    const activeElement = document.activeElement;
    const mainContent = document.getElementById('main-content');
    const isInMainContent = mainContent ? mainContent.contains(activeElement) : false;

    const focusableElements = Array.from(
      document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    );

    return {
      activeElement,
      isInMainContent,
      focusableElements
    };
  }
}