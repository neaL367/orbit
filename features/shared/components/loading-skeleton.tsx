'use client'

type LoadingSkeletonProps = {
  count?: number
  className?: string
  itemClassName?: string
}

export function LoadingSkeleton({
  count = 5,
  className = '',
  itemClassName = 'aspect-2/3 bg-zinc-900 rounded-xl animate-pulse',
}: LoadingSkeletonProps) {
  return (
    <div className={className}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={itemClassName} />
      ))}
    </div>
  )
}

