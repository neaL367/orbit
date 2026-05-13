/**
 * Static shell for /anime while the discovery client bundle + useSearchParams() resolve.
 * Mirrors discovery layout density so the transition does not jump from a blank shimmer.
 */
export function DiscoveryPageSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col gap-8 overflow-hidden lg:gap-12">
      <div className="relative flex-1 pb-20">
        <header className="relative pt-12">
          <div className="relative z-10 mb-16 flex flex-col gap-10 border-b border-white/10 pb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="h-3 w-32 shimmer bg-secondary/40 flex items-center justify-center font-mono text-[8px] text-white/30 tracking-widest">SYNC...</div>
                <div className="hidden h-px w-12 bg-white/10 sm:block" />
                <div className="hidden h-3 w-24 shimmer bg-secondary/30 sm:block" />
              </div>
              <div className="h-9 w-28 shimmer border border-white/10 bg-secondary/20" />
            </div>
            <div className="space-y-4">
              <div className="h-4 w-40 shimmer bg-secondary/30" />
              <div className="h-12 max-w-xl shimmer bg-secondary/25 flex items-center px-4 font-mono text-[10px] text-white/30 tracking-widest">LOADING_DISCOVERY_MATRIX</div>
              <div className="h-4 max-w-md shimmer bg-secondary/20" />
            </div>
          </div>
        </header>
        <div className="mb-8 flex flex-wrap items-center gap-3 border-b border-white/10 pb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-24 shimmer border border-white/10 bg-secondary/15" />
          ))}
        </div>
        <main className="py-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[2/3] shimmer border border-white/10 bg-secondary/20 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)] ring-1 ring-black/40" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
