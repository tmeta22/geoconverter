'use client';

import { useEffect } from 'react';
import { fontLoader } from '@/utils/font-loader';

/**
 * FontLoader Component
 * Handles font loading and provides visual feedback during the loading process
 */
export function FontLoader() {
  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Add loading class to document
        document.documentElement.classList.add('fonts-loading');
        document.documentElement.classList.remove('fonts-loaded');
        
        // Load critical fonts
        await fontLoader.loadCriticalFonts();
        
        // Mark fonts as loaded
        document.documentElement.classList.remove('fonts-loading');
        document.documentElement.classList.add('fonts-loaded');
        
        // Remove loading class from body
        document.body.classList.remove('fonts-loading');
        document.body.classList.add('fonts-loaded');
        
      } catch (error) {
        console.warn('Font loading failed:', error);
        
        // Still mark as loaded to prevent indefinite loading state
        document.documentElement.classList.remove('fonts-loading');
        document.documentElement.classList.add('fonts-loaded');
        document.body.classList.remove('fonts-loading');
        document.body.classList.add('fonts-loaded');
      }
    };

    // Start font loading immediately
    loadFonts();

    // Listen for font loading events
    const handleFontsLoaded = (event: CustomEvent) => {
      console.log('Fonts loaded successfully:', event.detail.loadedFonts);
    };

    document.addEventListener('fontsloaded', handleFontsLoaded as EventListener);

    // Cleanup
    return () => {
      document.removeEventListener('fontsloaded', handleFontsLoaded as EventListener);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}

export default FontLoader;