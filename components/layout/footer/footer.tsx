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
              <span className="font-mono text-[8px] uppercase tracking-[0.4em] text-primary/60">Core_Registry_System</span>
              <div className="font-mono text-xl font-black uppercase tracking-tighter">
                Anime<span className="text-primary italic">X</span>
              </div>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground max-w-xs leading-relaxed opacity-60">
              Autonomous search engine and indexing protocol for modern animation archives.
              Operated by community nodes. No Tracking. No Cookies.
            </p>
          </div>

          <div className="space-y-8 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
            <div className="flex flex-col gap-4">
              <span className="text-[8px] text-white/20">External_Links</span>
              <div className="flex flex-col gap-3">
                <Link href="https://anilist.co" target="_blank" className="hover:text-primary transition-colors flex items-center justify-between group">
                  <span>ANILIST_API_PROTOCOL</span> <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
                </Link>
                <Link href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center justify-between group">
                  <span>FETCH_SOURCE_CODE</span> <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end justify-end gap-6 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            <div className="flex flex-col md:items-end gap-1.5 order-2 md:order-1">
              <span className="text-[10px] text-foreground font-black tracking-tighter">COMMUNITY_DRIVEN_v1.0</span>
              <div className="text-[7px] text-muted-foreground opacity-40 text-right">
                RUNNING: NEXT_GEN_APP_ROUTER // SHAD_CN_CORE<br />
                SERIAL: 0x77-00-AX-99 // ST_SYNCHRONIZED
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
