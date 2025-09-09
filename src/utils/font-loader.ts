/**
 * Font Loading Utility
 * Ensures consistent font rendering across browsers and prevents font substitution
 */

export class FontLoader {
  private static instance: FontLoader;
  private loadedFonts: Set<string> = new Set();
  private fontLoadPromises: Map<string, Promise<void>> = new Map();

  private constructor() {}

  public static getInstance(): FontLoader {
    if (!FontLoader.instance) {
      FontLoader.instance = new FontLoader();
    }
    return FontLoader.instance;
  }

  /**
   * Load a font and return a promise that resolves when the font is ready
   */
  public async loadFont(fontFamily: string, fontWeight: string = '400'): Promise<void> {
    const fontKey = `${fontFamily}-${fontWeight}`;
    
    if (this.loadedFonts.has(fontKey)) {
      return Promise.resolve();
    }

    if (this.fontLoadPromises.has(fontKey)) {
      return this.fontLoadPromises.get(fontKey)!;
    }

    const promise = this.loadFontInternal(fontFamily, fontWeight);
    this.fontLoadPromises.set(fontKey, promise);
    
    try {
      await promise;
      this.loadedFonts.add(fontKey);
    } catch (error) {
      console.warn(`Failed to load font ${fontFamily}:`, error);
      this.fontLoadPromises.delete(fontKey);
    }

    return promise;
  }

  private async loadFontInternal(fontFamily: string, fontWeight: string): Promise<void> {
    // Check if Font Loading API is supported
    if ('fonts' in document) {
      try {
        await document.fonts.load(`${fontWeight} 16px "${fontFamily}"`);
        return;
      } catch (error) {
        console.warn(`Font Loading API failed for ${fontFamily}:`, error);
      }
    }

    // Fallback to manual font detection
    return this.detectFontLoad(fontFamily, fontWeight);
  }

  private detectFontLoad(fontFamily: string, fontWeight: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const testString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const fallbackFont = 'monospace';
      const testSize = '72px';
      
      // Create test elements
      const fallbackElement = this.createTestElement(testString, fallbackFont, fontWeight, testSize);
      const testElement = this.createTestElement(testString, `"${fontFamily}", ${fallbackFont}`, fontWeight, testSize);
      
      document.body.appendChild(fallbackElement);
      document.body.appendChild(testElement);
      
      const fallbackWidth = fallbackElement.offsetWidth;
      const fallbackHeight = fallbackElement.offsetHeight;
      
      const checkFont = () => {
        const testWidth = testElement.offsetWidth;
        const testHeight = testElement.offsetHeight;
        
        if (testWidth !== fallbackWidth || testHeight !== fallbackHeight) {
          // Font has loaded
          document.body.removeChild(fallbackElement);
          document.body.removeChild(testElement);
          resolve();
        }
      };
      
      // Check immediately
      checkFont();
      
      // Set up polling with timeout
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds with 100ms intervals
      
      const interval = setInterval(() => {
        attempts++;
        checkFont();
        
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          document.body.removeChild(fallbackElement);
          document.body.removeChild(testElement);
          reject(new Error(`Font loading timeout for ${fontFamily}`));
        }
      }, 100);
    });
  }

  private createTestElement(text: string, fontFamily: string, fontWeight: string, fontSize: string): HTMLElement {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    element.style.visibility = 'hidden';
    element.style.fontFamily = fontFamily;
    element.style.fontWeight = fontWeight;
    element.style.fontSize = fontSize;
    element.style.margin = '0';
    element.style.padding = '0';
    element.style.border = 'none';
    element.style.whiteSpace = 'nowrap';
    element.textContent = text;
    return element;
  }

  /**
   * Load all critical fonts for the application
   */
  public async loadCriticalFonts(): Promise<void> {
    const criticalFonts = [
      { family: 'Noto Sans Khmer', weights: ['400', '500', '600', '700'] },
      { family: 'Exo 2', weights: ['400', '500', '600'] },
      { family: 'Orbitron', weights: ['400', '500', '700'] }
    ];

    const loadPromises = criticalFonts.flatMap(font => 
      font.weights.map(weight => this.loadFont(font.family, weight))
    );

    try {
      await Promise.allSettled(loadPromises);
      this.markFontsAsLoaded();
    } catch (error) {
      console.warn('Some fonts failed to load:', error);
      this.markFontsAsLoaded(); // Still mark as loaded to prevent blocking
    }
  }

  private markFontsAsLoaded(): void {
    document.documentElement.classList.add('fonts-loaded');
    document.documentElement.classList.remove('fonts-loading');
    
    // Dispatch custom event
    const event = new CustomEvent('fontsloaded', {
      detail: { loadedFonts: Array.from(this.loadedFonts) }
    });
    document.dispatchEvent(event);
  }

  /**
   * Check if a specific font is loaded
   */
  public isFontLoaded(fontFamily: string, fontWeight: string = '400'): boolean {
    return this.loadedFonts.has(`${fontFamily}-${fontWeight}`);
  }

  /**
   * Get all loaded fonts
   */
  public getLoadedFonts(): string[] {
    return Array.from(this.loadedFonts);
  }
}

// Export singleton instance
export const fontLoader = FontLoader.getInstance();

// Auto-initialize font loading
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('fonts-loading');
    fontLoader.loadCriticalFonts();
  });
}