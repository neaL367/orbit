'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Route } from 'next'

type ErrorStateProps = {
  message?: string
  onRetryAction?: () => void
  retryLabel?: string
  homeHref?: Route
  homeLabel?: string
  className?: string
}

export function ErrorState({
  message = 'SYSTEM_SYNC_FAILURE: DATA_STREAM_INTERRUPTED',
  onRetryAction,
  retryLabel = 'RETRY_SYNC',
  homeHref = '/',
  homeLabel = 'RETURN_TO_BASE',
  className = '',
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-8 py-24 min-h-[40vh]', className)}>
      <div className="relative">
        <div className="absolute inset-0 blur-2xl bg-red-500/10 -z-10" />
        <div className="border border-red-500/20 bg-red-500/5 p-8 md:p-12 index-cut-tr flex flex-col items-center gap-6 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-500 mb-2">
            <div className="w-2 h-2 bg-red-500 animate-pulse" />
            <span className="font-mono text-[10px] font-black tracking-[0.3em] uppercase">Status: Error</span>
          </div>

          <p className="font-mono text-xs md:text-sm text-red-200/80 text-center leading-relaxed uppercase tracking-wider">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4 w-full">
            {onRetryAction && (
              <button
                onClick={onRetryAction}
                className="w-full sm:w-auto px-8 py-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500 transition-all font-mono text-[10px] font-black uppercase tracking-widest text-red-500"
              >
                {retryLabel}
              </button>
            )}
            {homeHref && (
              <Link
                href={homeHref}
                className="w-full sm:w-auto px-8 py-3 border border-white/10 hover:border-white/20 transition-all font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center"
              >
                {homeLabel}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 opacity-20">
        <div className="w-px h-12 bg-linear-to-b from-red-500 to-transparent" />
        <span className="font-mono text-[8px] uppercase tracking-tighter">Diagnostic_Ref: 0xDEADBEEF</span>
      </div>
    </div>
  )
}

