'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Github, ExternalLink } from 'lucide-react'
import { GITHUB_REPO_URL } from '@/lib/constants'

function FooterContent() {
  return (
    <footer className="border-t border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: AniList API Attribution */}
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>Powered by</span>
            <Link
              href="https://anilist.co"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-white hover:text-zinc-300 transition-colors font-medium"
            >
              <span>AniList</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <span>API</span>
          </div>

          {/* Right: GitHub Link */}
          <div className="flex items-center gap-2">
            <Link
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50 hover:bg-zinc-800/60 hover:border-zinc-700/50 transition-all duration-200 text-sm font-medium text-zinc-300 hover:text-white"
            >
              <Github className="h-4 w-4" />
              <span>View on GitHub</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
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

