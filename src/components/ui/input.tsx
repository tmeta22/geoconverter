import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg glass-morphism border border-primary/30 px-3 py-2 text-sm font-exo text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-glow focus-visible:border-neon-cyan focus-visible:glow-primary focus-visible:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-primary/50 hover:glow-primary/30 backdrop-blur-sm",
          "depth-input",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
