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
              <span>AniList API</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Right: GitHub Repository */}
          <div className="flex items-center gap-2">
            <Link
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>View on GitHub</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-zinc-800/50 text-center">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} AnimeX.
          </p>
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

