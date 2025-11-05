import Link from 'next/link'

export function AnimeDetailError() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Anime Not Found</h1>
        <p className="text-zinc-400 mb-6">
          The anime you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.
        </p>
        <Link href="/" className="text-blue-400 hover:text-blue-300 underline">
          Go back home
        </Link>
      </div>
    </div>
  )
}

