import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium font-exo transition-all duration-300 focus-visible:outline-none focus-glow disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden group backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "glass-morphism border-neon text-neon-cyan hover:glow-primary hover:scale-105 hover:shadow-lg hover:shadow-primary/25 active:scale-95",
        destructive:
          "glass-morphism border border-red-500/50 text-red-400 hover:border-red-400 hover:text-red-300 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 active:scale-95",
        outline:
          "border border-primary/30 bg-transparent backdrop-blur-sm text-primary hover:glass-morphism hover:border-neon hover:glow-primary hover:scale-105 active:scale-95",
        secondary:
          "glass-morphism border border-secondary/50 text-secondary hover:border-secondary hover:glow-secondary hover:scale-105 hover:shadow-lg hover:shadow-secondary/25 active:scale-95",
        ghost: "hover:glass-morphism hover:border-neon hover:text-neon-cyan hover:glow-primary transition-all duration-300",
        link: "text-neon-cyan hover:text-neon-purple hover:text-glow transition-all duration-300 underline-offset-4 hover:underline",
        holographic: "btn-holographic text-primary-foreground font-orbitron font-bold tracking-wider uppercase",
        neon: "bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border-2 border-neon-cyan/50 text-neon-cyan font-orbitron font-semibold tracking-wider hover:border-neon-cyan hover:glow-primary hover:scale-110 hover:rotate-1 active:scale-95 active:rotate-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base font-semibold",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), "depth-button", className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
