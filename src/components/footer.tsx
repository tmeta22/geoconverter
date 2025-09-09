"use client";

import React from 'react';
import { useLanguage } from '@/components/language-provider';
import { ExternalLink, MessageCircle, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/theme-toggle';
import { ClientOnly } from '@/components/client-only';

export function Footer() {
  const { t } = useLanguage();

  const contactLinks = [
    {
      label: t('blog'),
      url: 'https://www.tmeta.blog',
      icon: Globe,
    },
    {
      label: t('telegram'),
      url: 'https://t.me/tmeta9',
      icon: MessageCircle,
    },
  ];

  return (
    <motion.footer 
      className="mt-8 py-6 border-t border-border/20 bg-glass-bg/30 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-orbitron font-bold text-holographic mb-2">
              {t('contact')}
            </h3>
            <p className="text-sm text-muted-foreground font-exo">
              {t('helpAndSupport')}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {contactLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <motion.a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg glass-morphism border-neon-cyan/30 bg-glass-bg/50 hover:bg-glass-bg/80 hover:border-neon-cyan/50 transition-all duration-300 depth-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Icon className="h-4 w-4 text-neon-cyan" />
                  <span className="text-sm font-medium text-foreground">
                    {link.label}
                  </span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </motion.a>
              );
            })}
            <ClientOnly>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: contactLinks.length * 0.1 }}
              >
                <ThemeToggle />
              </motion.div>
            </ClientOnly>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/10 text-center">
          <p className="text-xs text-muted-foreground font-exo">
            {t('copyright')}
          </p>
        </div>
      </div>
    </motion.footer>
  );
}