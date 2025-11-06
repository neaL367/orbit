/**
 * Loading skeleton for anime list
 */

type AnimeListLoadingProps = {
  count?: number
  className?: string
}

export function AnimeListLoading({ count = 24, className = '' }: AnimeListLoadingProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="aspect-2/3 bg-zinc-900 rounded-xl animate-pulse" />
      ))}
    </div>
  )
}

