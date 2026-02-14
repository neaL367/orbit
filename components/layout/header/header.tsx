"use client"

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useSyncExternalStore, useState, useEffect } from 'react'
import { Menu, X, Terminal, Cpu, Search, Command } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SystemClock } from './system-clock'
import { CommandPalette } from './command-palette'
import type { Route } from 'next'

const menuItems = [
  { label: 'Trending', href: '/anime?sort=trending', sort: 'trending', code: 'TRX' },
  { label: 'Popular', href: '/anime?sort=popular', sort: 'popular', code: 'POP' },
  { label: 'Seasonal', href: '/anime?sort=seasonal', sort: 'seasonal', code: 'SEA' },
  { label: 'Top Rated', href: '/anime?sort=top-rated', sort: 'top-rated', code: 'RTD' },
  { label: 'Schedule', href: '/schedule', code: 'SCH' },
]

const emptySubscriber = () => () => { }

function HeaderContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const mounted = useSyncExternalStore(
    emptySubscriber,
    () => true,
    () => false
  )

  const isActive = (href: string, sort?: string) => {
    if (href === '/') return pathname === '/'
    if (href.startsWith('/anime')) {
      const currentSort = searchParams.get('sort')
      if (sort) return pathname === '/anime' && (currentSort === sort || (!currentSort && sort === 'trending'))
      return pathname === '/anime'
    }
    return pathname === href
  }

  // Autohide Logic: Track scroll telemetry
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show if scrolling up or at the top of the registry
      if (currentScrollY < lastScrollY || currentScrollY < 100 || isMenuOpen) {
        setIsVisible(true)
      }
      // Hide if scrolling down past threshold
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isMenuOpen])

  // Sync Telemetry with document
  useEffect(() => {
    document.documentElement.style.setProperty('--nav-visible', isVisible ? '1' : '0')
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isVisible, isSearchOpen])

  // Global Command Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!mounted) return <header className="h-20 border-b border-white/5" />

  return (
    <>
      <header className={cn(
        "sticky top-0 inset-x-0 z-110 h-20 bg-background/60 backdrop-blur-2xl border-b border-white/5 flex items-center transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)]",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}>
        {/* Top Scanning Line */}
        <div className="absolute top-0 left-0 w-full h-px bg-primary/10" />

        <div className="w-full h-full px-6 flex items-center relative">

          {/* ZONE 01: IDENTITY (Left Anchor) */}
          <div className="flex items-center z-10">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="flex flex-col group relative"
            >
              <div className="absolute -top-1 -left-2 w-1.5 h-1.5 border-t border-l border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-mono text-xl font-bold tracking-tighter uppercase leading-none">
                Anime<span className="text-primary italic">X</span>
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[0.4em] text-muted-foreground/60 font-black leading-none mt-1">
                INDEX_REGISTRY
              </span>
            </Link>
          </div>

          {/* ZONE 02: NAVIGATION (Absolute Center) */}
          <nav className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href as Route}
                className={cn(
                  "relative group/nav px-4 py-2 transition-all duration-300",
                  isActive(item.href, item.sort) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="font-mono text-[12px] font-black uppercase tracking-[0.2em]">
                  {item.label}
                </span>
                {isActive(item.href, item.sort) && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-px bg-primary shadow-[0_0_8px_var(--primary)]" />
                )}
              </Link>
            ))}
          </nav>

          {/* ZONE 03: COMMAND & TELEMETRY Section */}
          <div className="flex items-center gap-6 xl:gap-10 ml-auto">
            {/* Minimal Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden xl:flex items-center gap-3 px-3 py-1.5 bg-white/2 border border-white/5 hover:border-primary/40 hover:bg-white/3 transition-all index-cut-tr group/search"
            >
              <Search className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">Command_Inquiry</span>
              <div className="flex items-center gap-1 border border-white/10 px-1 py-0.5 rounded-sm">
                <Command className="w-2.5 h-2.5 text-muted-foreground/30" />
                <span className="font-mono text-[8px] font-bold text-muted-foreground/30">K</span>
              </div>
            </button>

            <div className="hidden xl:block h-8 w-px bg-white/10" />

            {/* Condensed Telemetry */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="font-mono text-[7px] font-black text-muted-foreground/30 uppercase tracking-widest leading-none mb-1">
                  SYS_CLK
                </span>
                <div className="font-mono text-[11px] font-black text-foreground/70 tracking-tighter text-right">
                  <SystemClock />
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="font-mono text-[7px] font-black text-muted-foreground/30 uppercase tracking-widest leading-none mb-1">
                  LNK_STT
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="font-mono text-[9px] font-black text-foreground/50 uppercase tracking-widest">ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-foreground/60 transition-all border border-white/5 bg-white/2 hover:bg-white/5 rounded-md active:scale-95 ml-4"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-105 bg-background/95 backdrop-blur-3xl transition-all duration-700 ease-[cubic-bezier(0.2,0,0,1)]",
          isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        )}
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-size-[40px_40px]" />
        </div>

        <div className="flex flex-col h-full pt-32 px-8 gap-12 max-w-lg mx-auto relative z-10">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 mb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-primary/40 font-black flex items-center gap-2">
                <Search className="w-3 h-3" />
                Archive_Inquiry
              </span>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    id="mobile-search"
                    placeholder="LOCATE_DATA..."
                    className="w-full bg-white/3 border border-white/5 px-4 py-4 font-mono text-[11px] uppercase tracking-widest text-foreground outline-none focus:border-primary/40 focus:bg-white/5 transition-all index-cut-tr"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value;
                        if (val) window.location.href = `/anime?search=${encodeURIComponent(val)}`;
                      }
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    const input = document.getElementById('mobile-search') as HTMLInputElement;
                    if (input?.value) window.location.href = `/anime?search=${encodeURIComponent(input.value)}`;
                  }}
                  className="px-8 py-4 bg-foreground text-background font-mono text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-primary index-cut-tr flex items-center gap-2"
                >
                  GO
                  <div className="w-1 h-1 bg-current rotate-45" />
                </button>
              </div>
            </div>

            <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-primary/40 font-black">Main_Navigation</span>
            <nav className="flex flex-col gap-2">
              {menuItems.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href as Route}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "group relative flex items-center justify-between p-6 border border-white/5 transition-all duration-300",
                    isActive(item.href, item.sort) ? "bg-primary border-primary" : "bg-white/2 hover:bg-white/5 hover:border-white/10"
                  )}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col">
                    <span className={cn("font-mono text-[10px] font-black opacity-40 mb-1", isActive(item.href, item.sort) && "text-primary-foreground")}>{item.code}</span>
                    <span className={cn("font-mono text-2xl font-black uppercase tracking-tighter", isActive(item.href, item.sort) ? "text-primary-foreground" : "text-foreground")}>
                      {item.label}
                    </span>
                  </div>
                  <Terminal className={cn("w-6 h-6 transition-all", isActive(item.href, item.sort) ? "text-primary-foreground" : "text-muted-foreground/20 group-hover:text-primary/40 group-hover:translate-x-2")} />
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto pb-12 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-white/5 bg-white/1">
                <span className="block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30 mb-2">Uptime</span>
                <span className="font-mono text-xs font-black text-emerald-500">99.98%</span>
              </div>
              <div className="p-4 border border-white/5 bg-white/1">
                <span className="block font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30 mb-2">Protocol</span>
                <span className="font-mono text-xs font-black text-blue-500">HTTPS_V3</span>
              </div>
            </div>
            <div className="flex items-center gap-4 py-6 border-t border-white/10">
              <Cpu className="w-5 h-5 text-primary/40" />
              <span className="font-mono text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground">RegistryCore_v1.2.0</span>
            </div>
          </div>
        </div>
      </div>

      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        menuItems={menuItems}
      />
    </>
  )
}

export function Header() {
  return (
    <Suspense fallback={<header className="h-20 border-b border-white/5" />}>
      <HeaderContent />
    </Suspense>
  )
}
