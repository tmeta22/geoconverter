"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/language-provider';
import { Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'km' : 'en');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className={cn(
        "glass-morphism border-neon-cyan/30 bg-glass-bg backdrop-blur-md",
        "hover:border-neon-cyan/50 hover:bg-glass-bg/80",
        "transition-all duration-300 depth-button",
        className
      )}
      aria-label="Toggle language"
    >
      <Languages className="h-4 w-4 mr-2" />
      <span className="font-medium">
        {language === 'en' ? 'ខ្មែរ' : 'EN'}
      </span>
    </Button>
  );
}