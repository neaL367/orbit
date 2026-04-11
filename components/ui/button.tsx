"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 font-mono font-bold uppercase tracking-widest transition-[color,background-color,border-color,transform,box-shadow] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-foreground text-background index-cut-tr hover:bg-primary hover:text-primary-foreground shadow-[4px_4px_0px_0px_rgba(255,255,255,0.08)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
        ghost:
          "border border-white/10 bg-white/5 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-white/10",
        destructiveGhost:
          "text-muted-foreground hover:text-red-500 border border-transparent hover:border-red-500/30",
      },
      size: {
        sm: "px-3 py-1.5 text-[9px]",
        md: "px-5 py-2 text-[10px]",
        lg: "px-8 py-4 text-xs",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
