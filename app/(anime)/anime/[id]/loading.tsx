export default function AnimeDetailLoading() {
  return (
    <div className="w-full pb-24" aria-hidden>
      <header className="w-screen relative left-1/2 -translate-x-1/2 min-h-[42dvh] max-h-[min(72dvh,820px)] h-[52dvh] overflow-hidden bg-secondary/15">
        <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay">
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />
        </div>
        <div className="absolute inset-0 shimmer bg-linear-to-br from-white/8 via-transparent to-white/5" />
        <div className="absolute inset-0 bg-linear-to-t from-background from-28% via-background/70 via-45% to-transparent to-100%" />
        <div className="absolute inset-0 bg-linear-to-b from-background/35 via-transparent to-transparent" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-6 pb-8 md:px-12 md:pb-10 lg:px-24 lg:pb-12">
          <div className="max-w-lg space-y-3">
            <div className="h-3 w-28 bg-white/15 shimmer flex items-center justify-center font-mono text-[8px] text-white/30">SYNC...</div>
            <div className="h-14 w-full max-w-md bg-white/12 shimmer md:h-20" />
          </div>
        </div>
      </header>

      <main className="relative z-30 -mt-14 w-full pb-20 md:-mt-24 md:pb-28 lg:-mt-32">
        <div className="pointer-events-none absolute inset-x-0 -top-px h-28 bg-linear-to-b from-background to-transparent md:h-36" />

        <div className="mx-auto max-w-[1600px] px-6 md:px-12 lg:px-24">
          <div className="relative flex flex-col gap-10 md:flex-row md:items-start md:gap-14 lg:gap-20">
            <div className="relative z-10 w-full md:-mt-4 md:w-80 md:shrink-0">
              <div className="absolute -inset-3 border border-white/6 md:-inset-4" />
              <div className="absolute -top-3 -left-3 h-6 w-6 border-t border-l border-white/15 md:-top-4 md:-left-4 md:h-8 md:w-8" />
              <div className="absolute -bottom-3 -right-3 h-6 w-6 border-b border-r border-white/15 md:-bottom-4 md:-right-4 md:h-8 md:w-8" />

              <div className="aspect-2/3 overflow-hidden rounded-sm border border-white/10 bg-secondary/20 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)] ring-1 ring-black/40 shimmer" />

              <div className="mt-8 border border-white/8 bg-linear-to-b from-white/5 to-transparent p-px">
                <div className="bg-background/55 p-5 backdrop-blur-sm">
                  <div className="h-2.5 w-20 bg-white/12 shimmer mb-2" />
                  <div className="h-8 w-24 bg-white/16 shimmer" />
                </div>
              </div>
            </div>

            <div className="relative z-10 min-w-0 flex-1 space-y-10 pt-2 md:pt-0">
              <div className="space-y-6">
                <div className="flex flex-wrap items-baseline gap-4">
                  <div className="h-4 w-36 bg-white/10 shimmer" />
                </div>

                <div className="h-14 w-full max-w-3xl bg-white/14 shimmer sm:h-20 flex items-center px-4 font-mono text-[10px] text-white/30 tracking-widest">LOADING_REGISTRY_DATA</div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="h-6 w-16 border border-white/15 bg-white/5 shimmer" />
                  ))}
                </div>

                <div className="mt-8 border border-white/5 bg-white/5 p-px">
                  <div className="grid grid-cols-2 gap-px sm:max-w-2xl sm:grid-cols-3 bg-background/40">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="bg-background/40 px-4 py-3">
                        <div className="h-2 w-16 bg-white/8 shimmer mb-2" />
                        <div className="h-6 w-20 bg-white/12 shimmer" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <section className="max-w-3xl space-y-3">
                <div className="h-3 w-20 bg-white/10 shimmer" />
                <div className="border-l-2 border-primary/20 bg-white/5 p-5 md:p-6 space-y-3">
                  <div className="h-3 w-full bg-white/8 shimmer" />
                  <div className="h-3 w-[90%] bg-white/8 shimmer" />
                  <div className="h-3 w-[75%] bg-white/8 shimmer" />
                </div>
              </section>

              <div className="flex flex-wrap gap-2 pt-2">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-7 w-24 border border-white/5 bg-white/5 shimmer" />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-24 space-y-24 md:mt-32 md:space-y-32 lg:mt-40 lg:space-y-40">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-20">
              <aside className="order-1 space-y-16 lg:col-span-4 lg:order-1">
                <section className="space-y-6">
                  <div className="space-y-1">
                    <div className="h-2 w-16 bg-white/8 shimmer" />
                    <div className="h-4 w-28 bg-white/12 shimmer" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-px bg-white/10 border border-white/10 p-px shadow-lg">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="flex items-center justify-between gap-4 bg-background/90 p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-5 bg-white/8 shimmer" />
                          <div className="h-3 w-16 bg-white/10 shimmer" />
                        </div>
                        <div className="h-3 w-20 bg-white/12 shimmer" />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="space-y-1 mb-2">
                    <div className="h-2 w-16 bg-white/8 shimmer" />
                    <div className="h-4 w-24 bg-white/12 shimmer" />
                  </div>
                  <div className="flex flex-col gap-px bg-white/10 border border-white/10 p-px shadow-lg">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="h-[76px] bg-background/90 shimmer" />
                    ))}
                  </div>
                </section>
              </aside>

              <div className="order-2 space-y-32 lg:col-span-8 lg:order-2">
                <section className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="h-2 w-16 bg-white/8 shimmer" />
                      <div className="h-4 w-28 bg-white/12 shimmer" />
                    </div>
                    <div className="hidden h-3 w-16 bg-white/8 shimmer sm:block" />
                  </div>

                  <div className="grid grid-cols-1 gap-px bg-white/10 border border-white/10 p-px shadow-xl md:grid-cols-2">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="flex h-20 sm:h-24 bg-background/90">
                        <div className="w-16 shrink-0 border-r border-white/5 bg-secondary/20 shimmer" />
                        <div className="flex flex-1 items-center justify-between px-4">
                          <div className="space-y-2 w-1/2">
                            <div className="h-3 w-[80%] bg-white/12 shimmer" />
                            <div className="h-2 w-16 bg-white/8 shimmer" />
                          </div>
                          <div className="space-y-2 w-1/3 flex flex-col items-end">
                            <div className="h-2.5 w-[60%] bg-white/10 shimmer" />
                            <div className="h-2 w-12 bg-white/6 shimmer" />
                          </div>
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
