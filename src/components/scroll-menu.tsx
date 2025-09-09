
"use client";

import * as React from "react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight, FileJson, Type, MapPin, Sparkles, File as FileIcon, FileText, Globe, ArrowRightLeft, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import { ConversionType } from "./converter";
import { useLanguage } from "@/components/language-provider";
import { TranslationKey } from "@/lib/translations";

const getMenuItems = (t: (key: TranslationKey) => string) => [
  { key: "kml", label: t('kmlToCSV'), icon: MapPin },
  { key: "gpx", label: t('gpxToCSV'), icon: MapPin },
  { key: "geojson", label: t('geoJsonToCSV'), icon: MapPin },
  { key: "xlsx", label: t('excelToCSV'), icon: FileIcon },
  { key: "coordinates", label: t('coordinateConversion'), icon: Globe },
  { key: "pdf", label: t('pdfExtraction'), icon: FileText },
  { key: "json", label: t('jsonToCSV'), icon: FileJson },
  { key: "cleanup", label: t('dataCleanup'), icon: Sparkles },
];

interface ScrollMenuProps {
    activeTab: ConversionType;
    onTabChange: (tab: ConversionType) => void;
}

export default function ScrollMenu({ activeTab, onTabChange }: ScrollMenuProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const menuItems = getMenuItems(t);

  const scrollBy = (offset: number) => {
    containerRef.current?.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Desktop Menu */}
      <div className="hidden md:flex relative items-center group">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 z-10 bg-background/80 hover:bg-background rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scrollBy(-200)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div
          ref={containerRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide snap-x px-4 py-2"
        >
          {menuItems.map((item) => (
            <motion.div key={item.key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98}}>
              <Button
                variant={activeTab === item.key ? "default" : "outline"}
                className="relative flex items-center gap-2 rounded-full snap-start shrink-0"
                onClick={() => onTabChange(item.key as ConversionType)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {activeTab === item.key && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 z-10 bg-background/80 hover:bg-background rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scrollBy(200)}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Menu (Bottom Sheet) */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex gap-2">
                {menuItems.find(item => item.key === activeTab)?.icon &&
                    (React.createElement(menuItems.find(item => item.key === activeTab)!.icon, { className: "h-4 w-4" }))
                }
               <span>{menuItems.find(item => item.key === activeTab)?.label || 'Select Format'}</span>
               <ChevronRight className="h-4 w-4 ml-auto opacity-50"/>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle>Select Conversion Type</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {menuItems.map((item) => (
                 <SheetTrigger asChild key={item.key}>
                    <Button
                      variant={activeTab === item.key ? "default" : "secondary"}
                      className="flex flex-col gap-1.5 py-6 h-auto"
                      onClick={() => onTabChange(item.key as ConversionType)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Button>
                </SheetTrigger>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

    