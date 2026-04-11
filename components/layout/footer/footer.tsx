'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { GITHUB_REPO_URL } from '@/lib/constants'

function FooterContent() {
  return (
    <footer className="border-t border-border bg-background py-10 sm:py-16">
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-8 relative">
          {/* Vertical Decor Lines */}
          <div className="hidden lg:block absolute left-1/3 top-0 w-[1px] h-full bg-gradient-to-b from-border/50 via-border/10 to-transparent" />
          <div className="hidden lg:block absolute left-2/3 top-0 w-[1px] h-full bg-gradient-to-b from-border/50 via-border/10 to-transparent" />

          <div className="space-y-8">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[8px] uppercase tracking-[0.35em] text-primary/60">About</span>
              <div className="font-mono text-xl font-black uppercase tracking-tighter">
                Anime<span className="text-primary italic">X</span>
              </div>
            </div>
            <p className="max-w-xs font-mono text-[9px] uppercase leading-relaxed tracking-[0.2em] text-muted-foreground opacity-70">
              Anime discovery and schedule views powered by the AniList GraphQL API. Built with Next.js and React.
            </p>
          </div>

          <div className="space-y-8 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
            <div className="flex flex-col gap-4">
              <span className="text-[8px] text-white/25">Links</span>
              <div className="flex flex-col gap-3">
                <Link href="https://anilist.co" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between transition-colors hover:text-primary">
                  <span>AniList</span> <ExternalLink className="h-2.5 w-2.5 opacity-40 group-hover:opacity-100" aria-hidden />
                </Link>
                <Link href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between transition-colors hover:text-primary">
                  <span>Source</span> <ExternalLink className="h-2.5 w-2.5 opacity-40 group-hover:opacity-100" aria-hidden />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end justify-end gap-6 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            <div className="order-2 flex flex-col gap-1.5 md:order-1 md:items-end">
              <span className="text-[10px] font-black tracking-tight text-foreground">Open data · AniList</span>
              <div className="text-right text-[8px] uppercase tracking-wider text-muted-foreground/50">
                Next.js App Router · React 19
              </div>
            </div>
            <div className="order-1 md:order-2 px-3 py-1 border border-white/5 bg-white/5 w-fit">
              <span className="text-foreground tracking-[0.3em]">EST. 2026</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export function Footer() {
  return (
    <Suspense>
      <FooterContent />
    </Suspense>
  )
}
