/** Route-level loading UI — mirrors detail hero + two-column rhythm. */
export default function AnimeDetailLoading() {
  return (
    <div className="w-full pb-20">
      <div
        className="w-screen relative left-1/2 -translate-x-1/2 h-[48dvh] max-h-[min(72dvh,820px)] min-h-[40dvh] overflow-hidden bg-muted/15"
        aria-hidden
      >
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-6 pb-8 md:px-12 md:pb-10 lg:px-24 lg:pb-12">
          <div className="h-20 max-w-md rounded-md border border-white/10 bg-black/30 motion-reduce:animate-none animate-pulse" />
        </div>
      </div>

      <div className="relative z-10 -mt-24 mx-auto max-w-[1600px] px-6 pb-16 md:-mt-40 md:px-12 md:pb-24 lg:px-24">
        <div className="flex flex-col gap-10 md:flex-row md:gap-14">
          <div className="mx-auto aspect-2/3 w-full max-w-[280px] shrink-0 rounded-sm border border-white/10 bg-muted/20 motion-reduce:animate-none animate-pulse md:mx-0" />
          <div className="min-w-0 flex-1 space-y-6 pt-4 md:pt-8">
            <div className="h-6 w-28 rounded-sm bg-muted/25 motion-reduce:animate-none animate-pulse" />
            <div className="h-12 w-full max-w-2xl rounded-sm bg-muted/20 motion-reduce:animate-none animate-pulse sm:h-16" />
            <div className="h-px w-full max-w-xl bg-white/10" />
            <div className="space-y-3">
              <div className="h-3 w-full rounded-sm bg-muted/15 motion-reduce:animate-none animate-pulse" />
              <div className="h-3 w-full rounded-sm bg-muted/15 motion-reduce:animate-none animate-pulse" />
              <div className="h-3 w-[min(100%,36rem)] rounded-sm bg-muted/15 motion-reduce:animate-none animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
