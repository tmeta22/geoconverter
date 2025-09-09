"use client";

import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/language-provider';
import { motion, AnimatePresence } from 'framer-motion';

interface InstallBannerProps {
  installPrompt: any;
  onInstall: () => void;
  onDismiss: () => void;
}

export function InstallBanner({ installPrompt, onInstall, onDismiss }: InstallBannerProps) {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the banner
    const dismissed = localStorage.getItem('pwa-install-banner-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show banner after a short delay if install prompt is available
    if (installPrompt && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }

    // For testing: show banner even without install prompt in development
    if (process.env.NODE_ENV === 'development' && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000); // Show after 5 seconds in dev mode

      return () => clearTimeout(timer);
    }
  }, [installPrompt, isDismissed]);

  // Add keyboard shortcut to reset dismissal (for testing)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        localStorage.removeItem('pwa-install-banner-dismissed');
        setIsDismissed(false);
        console.log('PWA install banner dismissal reset');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleInstall = () => {
    onInstall();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-banner-dismissed', 'true');
    onDismiss();
  };

  if (isDismissed) {
    return null;
  }

  // Don't show in production if no install prompt available
  if (!installPrompt && process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary/90 to-secondary/90 backdrop-blur-md border-b border-primary/20 shadow-lg"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Download className="h-5 w-5 text-white" />
                </div>
                <div className="text-white">
                  <h4 className="font-semibold text-sm">{t('installApp')}</h4>
                  <p className="text-xs text-white/80">{t('installAppDescription')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInstall}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                >
                  {t('installNow')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  {t('installLater')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}