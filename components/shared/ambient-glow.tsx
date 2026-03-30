"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { useMouseTrajectory } from '@/hooks/use-mouse-trajectory'

interface AmbientGlowProps {
  variant?: 'primary' | 'accent' | 'muted'
  followMouse?: boolean
  className?: string
}

/**
 * Reusable ambient background glow component.
 * Features optional mouse-following trajectory and subtle animation.
 */
export function AmbientGlow({ 
  variant = 'primary', 
  followMouse = true,
  className 
}: AmbientGlowProps) {
  const glowRef = useMouseTrajectory<HTMLDivElement>({ size: 300 })
  
  return (
    <div className={cn("fixed inset-0 pointer-events-none z-0 overflow-hidden", className)}>
      <div 
        ref={followMouse ? glowRef : null}
        className={cn(
          "absolute pointer-events-none w-[600px] h-[600px] rounded-full opacity-[0.03] blur-[120px] will-change-transform",
          variant === 'primary' && "bg-[radial-gradient(circle,var(--primary)_0%,transparent_70%)]",
          variant === 'accent' && "bg-[radial-gradient(circle,var(--accent)_0%,transparent_70%)]",
          variant === 'muted' && "bg-[radial-gradient(circle,var(--muted-foreground)_0%,transparent_70%)]",
          !followMouse && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        )}
      />
      
      {/* Subtle Grid Scan Overlay */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-size-[60px_60px]" />
        <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background" />
      </div>
    </div>
  )
}
