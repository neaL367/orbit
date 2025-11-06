import Link from 'next/link'

type AnimeDetailErrorProps = {
  onRetry?: () => void
}

export function AnimeDetailError({ onRetry }: AnimeDetailErrorProps) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Anime Not Found</h1>
        <p className="text-zinc-400 mb-6">
          The anime you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-white"
            >
              Try Again
            </button>
          )}
          <Link href="/" className="text-blue-400 hover:text-blue-300 underline">
            Go back home
          </Link>
        </div>
      </div>
    </div>
  )
}

