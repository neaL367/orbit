import { Button } from "@/components/ui/button"

type AnimeListLoadMoreProps = {
  onLoadMore: () => void
  isLoading: boolean
  hasMore: boolean
}

export function AnimeListLoadMore({ onLoadMore, isLoading, hasMore }: AnimeListLoadMoreProps) {
  if (!hasMore) {
    return (
      <div className="text-center py-8 text-zinc-400">
        No more anime to load
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center">
      <Button
        onClick={onLoadMore}
        disabled={isLoading}
      >
        {isLoading ? 'Loading more...' : 'Load More'}
      </Button>
    </div>
  )
}

