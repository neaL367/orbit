'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

function FooterContent() {
  return (
    <footer className="border-t border-border bg-background py-16">
      <div className="container mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
          <div className="space-y-6">
            <div className="font-mono text-xl font-bold uppercase tracking-tighter">
              Anime<span className="text-muted-foreground">X</span>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground max-w-xs leading-relaxed">
              Autonomous search engine and indexing protocol for modern animation archives.
              Operated by the community. No Tracking. No Cookies.
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-6 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            <div className="flex gap-8">
              <Link href="https://anilist.co" target="_blank" className="hover:text-foreground transition-colors flex items-center gap-2">
                ANILIST_API <ExternalLink className="w-2.5 h-2.5" />
              </Link>
              <Link href="https://github.com/neaL367/orbit" target="_blank" className="hover:text-foreground transition-colors flex items-center gap-2">
                SOURCE_CODE <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
            <div className="text-[8px] text-muted-foreground">
              EST. 2026 // SERIAL_NO: 77-00-AX-99
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
