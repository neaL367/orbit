export function AnimeDetailLoading() {
  return (
    <div className="min-h-[70dvh] bg-black text-white">
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-96 bg-zinc-900 rounded-xl" />
          <div className="h-64 bg-zinc-900 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

