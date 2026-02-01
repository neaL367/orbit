import { Button } from "@/components/ui/button"

type LoadMoreProps = {
  onLoadMore: () => void
  isLoading: boolean
  hasMore: boolean
}

export function LoadMore({ onLoadMore, isLoading, hasMore }: LoadMoreProps) {
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
        variant="outline"
      >
        {isLoading ? 'Loading more...' : 'Load More'}
      </Button>
    </div>
  )
}

