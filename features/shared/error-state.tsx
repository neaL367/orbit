'use client'

import Link from 'next/link'
import type { Route } from 'next'

type ErrorStateProps = {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  homeHref?: Route
  homeLabel?: string
  className?: string
}

export function ErrorState({
  title = 'Error',
  message = 'Something went wrong. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  homeHref = '/',
  homeLabel = 'Go back home',
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-12 ${className}`}>
      <p className="text-red-400">{message}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-white"
          >
            {retryLabel}
          </button>
        )}
        {homeHref && (
          <Link
            href={homeHref}
            className="text-blue-400 hover:text-blue-300 underline"
          >
            {homeLabel}
          </Link>
        )}
      </div>
    </div>
  )
}

