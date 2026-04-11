"use client"

import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, spellCheck = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        spellCheck={spellCheck}
        className={cn(
          "w-full bg-white/5 border border-white/10 px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-foreground outline-none transition-[border-color,background-color] placeholder:text-muted-foreground/40 focus:border-primary/50 focus:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring/40 index-cut-tr",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"
