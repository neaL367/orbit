type ErrorProps = {
  onRetry: () => void
}

export function Error({ onRetry }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <p className="text-red-400">Error loading anime. Please try again.</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-white"
      >
        Try Again
      </button>
    </div>
  )
}

