"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex items-center rounded-full p-1 glass-morphism border border-primary/30 backdrop-blur-sm">
      <Button
        variant={theme === 'light' ? 'neon' : 'ghost'}
        size="icon"
        className="rounded-full h-8 w-8 transition-all duration-300"
        onClick={() => setTheme("light")}
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Light</span>
      </Button>
      <Button
        variant={theme === 'dark' ? 'neon' : 'ghost'}
        size="icon"
        className="rounded-full h-8 w-8 transition-all duration-300"
        onClick={() => setTheme("dark")}
      >
        <Moon className="h-4 w-4" />
        <span className="sr-only">Dark</span>
      </Button>
      <Button
        variant={theme === 'system' ? 'neon' : 'ghost'}
        size="icon"
        className="rounded-full h-8 w-8 transition-all duration-300"
        onClick={() => setTheme("system")}
      >
        <Monitor className="h-4 w-4" />
        <span className="sr-only">System</span>
      </Button>
    </div>
  )
}
