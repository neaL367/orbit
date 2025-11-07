/**
 * Loading skeleton for anime list
 */

import { cn } from '@/lib/utils'

type LoadingProps = {
  count?: number
  className?: string
}

export function Loading({ count = 24, className }: LoadingProps) {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4', className)}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="aspect-2/3 bg-zinc-900 rounded-xl animate-pulse" />
      ))}
    </div>
  )
}

