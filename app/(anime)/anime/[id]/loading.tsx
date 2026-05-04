export default function AnimeDetailLoading() {
  return (
    <div className="w-full pb-24" aria-hidden>
      <header className="relative left-1/2 h-[52dvh] min-h-[42dvh] max-h-[min(72dvh,820px)] w-screen -translate-x-1/2 overflow-hidden bg-secondary/15">
        <div className="absolute inset-0 shimmer bg-linear-to-br from-white/8 via-transparent to-white/5" />
        <div className="absolute inset-0 bg-linear-to-t from-background from-28% via-background/70 via-45% to-transparent to-100%" />
        <div className="absolute inset-0 bg-linear-to-b from-background/35 via-transparent to-transparent" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-6 pb-8 md:px-12 md:pb-10 lg:px-24 lg:pb-12">
          <div className="max-w-lg space-y-3">
            <div className="h-3 w-28 bg-white/15 shimmer" />
            <div className="h-14 w-full max-w-md bg-white/12 shimmer md:h-20" />
          </div>
        </div>
      </header>

      <main className="relative z-30 -mt-16 w-full pb-24 md:-mt-28 md:pb-32 lg:-mt-36">
        <div className="pointer-events-none absolute inset-x-0 -top-px h-32 bg-linear-to-b from-background to-transparent md:h-40" />

        <div className="mx-auto max-w-[1600px] px-6 md:px-12 lg:px-24">
          <div className="relative flex flex-col gap-10 md:flex-row md:items-start md:gap-14 lg:gap-20">
            <div className="relative z-10 mx-auto w-full max-w-[320px] shrink-0 md:mx-0 md:w-80">
              <div className="absolute -inset-3 border border-white/6 md:-inset-4" />
              <div className="absolute -left-3 -top-3 h-6 w-6 border-l border-t border-white/15 md:-left-4 md:-top-4 md:h-8 md:w-8" />
              <div className="absolute -bottom-3 -right-3 h-6 w-6 border-b border-r border-white/15 md:-bottom-4 md:-right-4 md:h-8 md:w-8" />

              <div className="aspect-2/3 overflow-hidden rounded-sm border border-white/10 bg-secondary/20 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)] ring-1 ring-black/40 md:rounded-md shimmer" />

              <div className="mt-8 border border-white/5 bg-white/5 p-px tabular-nums">
                <div className="bg-background/40 p-4">
                  <div className="h-2.5 w-20 bg-white/12 shimmer" />
                  <div className="mt-3 h-6 w-32 bg-white/16 shimmer" />
                </div>
              </div>
            </div>

            <div className="relative z-10 min-w-0 flex-1 space-y-10 pt-2 md:pt-0">
              <div className="space-y-5">
                <div className="h-4 w-36 bg-white/10 shimmer" />
                <div className="h-14 w-full max-w-3xl bg-white/14 shimmer sm:h-20" />
                <div className="h-4 w-full max-w-2xl bg-white/10 shimmer" />

                <div className="max-w-3xl space-y-3">
                  <div className="h-3 w-full bg-white/8 shimmer" />
                  <div className="h-3 w-full bg-white/8 shimmer" />
                  <div className="h-3 w-[min(100%,42rem)] bg-white/8 shimmer" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-8 w-24 border border-white/8 bg-white/5 shimmer" />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-24 space-y-24 md:mt-32 md:space-y-32 lg:mt-40 lg:space-y-40">
            <section className="space-y-12">
              <div className="mb-16 flex items-end justify-between border-b border-white/5 pb-4">
                <div className="h-8 w-36 bg-white/12 shimmer" />
                <div className="hidden h-3 w-28 bg-white/8 shimmer sm:block" />
              </div>
              <div className="aspect-video w-full max-w-6xl border border-white/8 bg-secondary/20 shimmer" />
            </section>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-20">
              <aside className="order-1 space-y-16 lg:col-span-4 lg:order-1">
                <section className="space-y-8">
                  <div className="space-y-2">
                    <div className="h-2.5 w-16 bg-white/8 shimmer" />
                    <div className="h-4 w-28 bg-white/12 shimmer" />
                  </div>

                  <div className="grid grid-cols-2 gap-px border border-white/5 bg-white/5 p-px md:grid-cols-3 lg:grid-cols-1">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="flex items-center justify-between gap-4 bg-background/50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-5 bg-white/8 shimmer" />
                          <div className="h-3 w-16 bg-white/10 shimmer" />
                        </div>
                        <div className="h-3 w-20 bg-white/12 shimmer" />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-8">
                  <div className="h-8 w-32 bg-white/12 shimmer" />
                  <div className="space-y-3">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="h-16 border border-white/6 bg-white/3 shimmer" />
                    ))}
                  </div>
                </section>

                <section className="space-y-10">
                  <div className="h-8 w-28 bg-white/12 shimmer" />
                  <div className="space-y-3">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="h-16 border border-white/6 bg-white/2 shimmer" />
                    ))}
                  </div>
                </section>
              </aside>

              <div className="order-2 space-y-32 lg:col-span-8 lg:order-2">
                <section className="space-y-12">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-28 bg-white/12 shimmer" />
                    <div className="hidden h-3 w-16 bg-white/8 shimmer sm:block" />
                  </div>

                  <div className="grid grid-cols-1 gap-px border border-white/5 bg-white/5 p-px md:grid-cols-2">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="flex h-24 bg-background">
                        <div className="w-16 shrink-0 border-r border-white/5 bg-secondary/20 shimmer" />
                        <div className="flex flex-1 items-center justify-between px-4">
                          <div className="space-y-2">
                            <div className="h-3 w-24 bg-white/12 shimmer" />
                            <div className="h-2.5 w-16 bg-white/8 shimmer" />
                          </div>
                          <div className="hidden h-14 w-14 bg-secondary/20 shimmer sm:block" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-12">
                  <div className="h-8 w-52 bg-white/12 shimmer" />
                  <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="space-y-4">
                        <div className="aspect-2/3 border border-white/10 bg-secondary/20 shimmer" />
                        <div className="space-y-2">
                          <div className="h-3 w-full bg-white/10 shimmer" />
                          <div className="h-[2px] w-12 bg-white/8" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
