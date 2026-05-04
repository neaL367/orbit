"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type SheetProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** Panel width / layout */
  panelClassName?: string
  /** Accessible name for the dialog surface */
  title: string
}

export function Sheet({ open, onClose, children, panelClassName, title }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  /** Only true while `open` — reset when panel closes so the next open traps focus again. */
  const openedRoundRef = useRef(false)

  useEffect(() => {
    if (!open) {
      openedRoundRef.current = false
      document.body.style.overflow = ""
      return
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"

    // Focus only when the sheet *opens*, not when the parent re-renders with a new `onClose`
    // or when children change (e.g. "Clear all" appearing). Otherwise the first focusable
    // steals focus from the search field while typing.
    if (!openedRoundRef.current) {
      openedRoundRef.current = true
      const focusable = panelRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      queueMicrotask(() => focusable?.focus())
    }

    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <div
      className={cn(
        "fixed inset-0 z-150 transition-opacity duration-300",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close panel"
        tabIndex={open ? 0 : -1}
        className={cn(
          "absolute inset-0 bg-background/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        {...(!open ? ({ inert: true } as { inert: boolean }) : {})}
        className={cn(
          "absolute top-0 right-0 flex h-full w-full flex-col overflow-hidden border-l border-white/10 bg-background/95 shadow-2xl backdrop-blur-3xl transition-transform duration-300 md:max-w-[400px]",
          open ? "translate-x-0" : "translate-x-full",
          panelClassName
        )}
        style={{ overscrollBehavior: "contain" }}
      >
        {children}
      </div>
    </div>
  )
}
