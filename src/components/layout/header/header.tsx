'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense, useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'
import type { Route } from 'next'

const menuItems = [
  { label: 'Archive', href: '/anime' },
  { label: 'Popular', href: '/anime?sort=popular', sort: 'popular' },
  { label: 'Seasonal', href: '/anime?sort=seasonal', sort: 'seasonal' },
  { label: 'Top Rated', href: '/anime?sort=top-rated', sort: 'top-rated' },
  { label: 'Schedule', href: '/schedule' },
]

const emptySubscriber = () => () => { }

function HeaderContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const mounted = useSyncExternalStore(
    emptySubscriber,
    () => true,
    () => false
  )

  const isActive = (href: string, sort?: string) => {
    if (href === '/') return pathname === '/'
    if (href.startsWith('/anime')) {
      const currentSort = searchParams.get('sort')
      if (sort) return pathname === '/anime' && currentSort === sort
      return pathname === '/anime' && !currentSort
    }
    return pathname === href
  }

  if (!mounted) return <header className="h-16 border-b border-border" />

  return (
    <header className="fixed top-0 inset-x-0 z-[100] h-16 bg-background/90 backdrop-blur-sm border-b border-border flex items-center">
      <div className="container mx-auto px-6 md:px-12 lg:px-24 flex justify-between items-center">
        <div className="flex items-center gap-12">
          <Link
            href="/"
            className="flex flex-col group"
          >
            <span className="font-mono text-xl font-bold tracking-tighter uppercase leading-none">
              Anime<span className="text-muted-foreground/40">X</span>
            </span>
            <span className="font-mono text-[8px] uppercase tracking-[0.4em] text-muted-foreground/60 leading-none mt-1">
              Index_Archive
            </span>
          </Link>

          <nav className="hidden md:flex gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href as Route}
                className={cn(
                  "font-mono text-[9px] uppercase tracking-widest transition-all duration-300 py-1 border-b",
                  isActive(item.href, item.sort)
                    ? "text-foreground border-foreground"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/50">
          <div className="hidden sm:block">
            REF_ID: <span className="text-foreground">AX-1903-22</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-foreground animate-pulse" />
            <span className="text-foreground">ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export function Header() {
  return (
    <Suspense fallback={<header className="h-16 border-b border-border" />}>
      <HeaderContent />
    </Suspense>
  )
}
