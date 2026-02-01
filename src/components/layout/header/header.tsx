'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense, useState, useEffect, useRef, startTransition } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
// import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from '@/components/ui/drawer'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'
import type { Route } from 'next'

type MenuItem = {
  label: string
  href: string
  sort?: string
}

const menuItems: MenuItem[] = [
  { label: 'Trending', href: '/anime?sort=trending', sort: 'trending' },
  { label: 'Popular', href: '/anime?sort=popular', sort: 'popular' },
  { label: 'Top 100', href: '/anime?sort=top-rated', sort: 'top-rated' },
  { label: 'Seasonal', href: '/anime?sort=seasonal', sort: 'seasonal' },
  { label: 'Schedule', href: '/schedule' },
]

function HeaderContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const prevPathnameRef = useRef(pathname)
  const prevSearchParamsRef = useRef(searchParams.toString())
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    startTransition(() => {
      setMounted(true)
    })
  }, [])

  useEffect(() => {
    const prevPathname = prevPathnameRef.current
    const prevSearchParams = prevSearchParamsRef.current

    if (pathname.startsWith('/anime/') && !prevPathname.startsWith('/anime/')) {
      const referrerData = {
        pathname: prevPathname,
        search: prevSearchParams,
        sort: prevPathname === '/anime' ? new URLSearchParams(prevSearchParams).get('sort') : null,
      }
      sessionStorage.setItem('animeDetailReferrer', JSON.stringify(referrerData))
    }

    if (prevPathname.startsWith('/anime/') && !pathname.startsWith('/anime/')) {
      sessionStorage.removeItem('animeDetailReferrer')
      sessionStorage.removeItem('animeDetailTitle')
    }

    // if (prevPathname !== pathname || prevSearchParams !== searchParams.toString()) {
    //   prevPathnameRef.current = pathname
    //   prevSearchParamsRef.current = searchParams.toString()
    //   startTransition(() => {
    //     setOpen(false)
    //   })
    // }
  }, [pathname, searchParams])

  useEffect(() => {
    const navElement = navRef.current
    if (!navElement) return

    const observer = new MutationObserver(() => {
      if (navElement.getAttribute('aria-hidden') === 'true') {
        navElement.removeAttribute('aria-hidden')
      }
      if (navElement.getAttribute('data-aria-hidden') === 'true') {
        navElement.removeAttribute('data-aria-hidden')
      }
    })

    observer.observe(navElement, {
      attributes: true,
      attributeFilter: ['aria-hidden', 'data-aria-hidden'],
    })

    return () => observer.disconnect()
  }, [])

  const isActive = (href: string, sort?: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    if (href.startsWith('/anime')) {
      const currentSort = searchParams.get('sort')
      return pathname === '/anime' && currentSort === sort
    }
    return pathname === href
  }

  const getCurrentPageLabel = () => {
    if (pathname === '/') return 'pages'
    if (pathname === '/schedule') return 'schedule'
    if (pathname === '/anime') {
      const currentSort = searchParams.get('sort')
      const matchingItem = menuItems.find((item) => item.sort === currentSort)
      return matchingItem?.label.toLowerCase() || 'pages'
    }
    if (pathname.startsWith('/anime/')) {
      if (typeof window === 'undefined') return 'pages'
      const referrer = sessionStorage.getItem('animeDetailReferrer')
      if (referrer) {
        try {
          const referrerData = JSON.parse(referrer)
          if (referrerData.pathname === '/') return 'pages'
          if (referrerData.pathname === '/schedule') return 'schedule'
          if (referrerData.pathname === '/anime' && referrerData.sort) {
            const item = menuItems.find(item => item.sort === referrerData.sort)
            return item?.label.toLowerCase() || 'pages'
          }
        } catch {
          // Invalid JSON
        }
      }
      return 'pages'
    }
    return 'pages'
  }

  const currentPageLabel = getCurrentPageLabel()

  const isCurrentPageActive = () => {
    if (pathname === '/') return true
    if (pathname === '/schedule') return true
    if (pathname === '/anime') {
      return searchParams.get('sort') !== null
    }
    return false
  }

  const getBackLink = (): Route | null => {
    if (!pathname.startsWith('/anime/')) return null
    if (typeof window === 'undefined') return '/' as Route

    const referrer = sessionStorage.getItem('animeDetailReferrer')
    if (!referrer) return '/' as Route

    try {
      const referrerData = JSON.parse(referrer)

      if (referrerData.pathname === '/') return '/' as Route
      if (referrerData.pathname === '/schedule') return '/schedule' as Route

      if (referrerData.pathname === '/anime') {
        if (referrerData.search) {
          return (`/anime?${referrerData.search}` as Route)
        }
        if (referrerData.sort) {
          const item = menuItems.find(item => item.sort === referrerData.sort)
          if (item) return item.href as Route
        }
        return '/anime' as Route
      }
    } catch {
      // Invalid JSON
    }

    return '/' as Route
  }

  const getAnimeTitleFromStorage = (): string | null => {
    if (!pathname.startsWith('/anime/')) return null
    if (typeof window === 'undefined') return null

    const storedTitle = sessionStorage.getItem('animeDetailTitle')
    if (storedTitle) return storedTitle

    const docTitle = document.title
    if (docTitle && docTitle !== 'Anime Not Found') {
      const titleMatch = docTitle.split(' | ')[0]
      if (titleMatch && titleMatch !== 'AnimeX') {
        return titleMatch
      }
    }

    return null
  }

  const backLink = mounted ? getBackLink() : null
  const animeTitle = mounted ? getAnimeTitleFromStorage() : null
  const isDetailPage = pathname.startsWith('/anime/') && /^\d+$/.test(pathname.split('/')[2] || '')

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg"
      aria-hidden={false}
    >
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-white hover:text-zinc-300 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:ring-zinc-400 rounded-md px-1 -ml-1"
            >
              AnimeX
            </Link>

            <div className="flex items-center gap-2 min-w-0 overflow-x-scroll md:overflow-x-visible scrollbar-hide">
              {isDetailPage ? (
                <>
                  <BreadcrumbSeparator className="text-zinc-600 shrink-0">
                    <span className="mx-1">/</span>
                  </BreadcrumbSeparator>
                  <BreadcrumbItem className="flex items-center">
                    <BreadcrumbLink asChild>
                      <Link
                        href={backLink || '/'}
                        scroll={false}
                        className={cn(
                          "text-sm font-medium transition-all duration-200 rounded-md px-2 py-1 -mx-1",
                          "text-zinc-400 hover:text-white hover:bg-zinc-800/40",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:ring-zinc-400"
                        )}
                      >
                        Back
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  <BreadcrumbSeparator className="text-zinc-600 shrink-0">
                    <span className="mx-1">/</span>
                  </BreadcrumbSeparator>
                  <BreadcrumbItem className="flex items-center">
                    <BreadcrumbPage
                      className="text-sm font-semibold text-zinc-300"
                    >
                      Anime
                    </BreadcrumbPage>
                  </BreadcrumbItem>

                  {mounted && animeTitle && (
                    <>
                      <BreadcrumbSeparator className="text-zinc-600 shrink-0">
                        <span className="mx-1">/</span>
                      </BreadcrumbSeparator>
                      <BreadcrumbItem className="flex items-center">
                        <BreadcrumbPage
                          className="text-sm font-semibold text-white truncate max-w-[300px]"
                          title={animeTitle}
                        >
                          {animeTitle}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </>
              ) : (
                <>
                  <BreadcrumbSeparator className="text-zinc-600 shrink-0">
                    <span className="mx-1">/</span>
                  </BreadcrumbSeparator>
                  <BreadcrumbItem className="flex items-center">
                    <BreadcrumbLink asChild>
                      <Link
                        href="/"
                        className={cn(
                          "text-sm font-medium transition-all duration-200 rounded-md px-2 py-1 -mx-1",
                          "text-zinc-400 hover:text-white hover:bg-zinc-800/40",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:ring-zinc-400",
                          pathname === '/' && "text-white"
                        )}
                      >
                        Home
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  <BreadcrumbSeparator className="text-zinc-600 shrink-0">
                    <span className="mx-1">/</span>
                  </BreadcrumbSeparator>
                  <BreadcrumbItem className="flex items-center">
                    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          className={cn(
                            'text-sm font-medium rounded-md px-2 py-1 h-auto transition-all duration-200 bg-transparent',
                            'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent',
                            'hover:text-white hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-white',
                            'inline-flex items-center gap-1.5 text-zinc-400',
                            pathname === '/'
                              ? 'text-zinc-400'
                              : isCurrentPageActive() && 'text-white'
                          )}
                        >
                          <span className="capitalize">{currentPageLabel}</span>
                          <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        className="bg-zinc-900/95 backdrop-blur-xl border-transparent shadow-2xl max-w-[200px] p-1.5 gap-0.5"
                      >
                        {menuItems.map((item) => {
                          const active = isActive(item.href, item.sort)
                          return (
                            <Link
                              key={item.label}
                              href={item.href as Route}
                              onClick={() => setMenuOpen(false)}
                              aria-current={active ? 'page' : undefined}
                              className={cn(
                                'flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200',
                                'cursor-pointer outline-none',
                                'focus:bg-zinc-800/60 focus:text-white',
                                active
                                  ? 'bg-zinc-800/70 text-white shadow-sm'
                                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                              )}
                            >
                              <span className={cn(
                                'flex-1',
                                active && 'font-semibold'
                              )}>
                                {item.label}
                              </span>
                              {active && (
                                <span className="ml-2 h-1.5 w-1.5 rounded-full bg-white/80" />
                              )}
                            </Link>
                          )
                        })}
                      </PopoverContent>
                    </Popover>
                  </BreadcrumbItem>
                </>
              )}
            </div>
          </div>

          {/* <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-zinc-800/50"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </DrawerTrigger>
            <DrawerContent 
              className="bg-zinc-950 border-zinc-800"
              aria-describedby={undefined}
            >
              <DrawerHeader>
                <DrawerTitle className="text-white text-xl font-bold">Navigation</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-4 space-y-1">
                {menuItems.map((item) => {
                  const active = isActive(item.href, item.sort)
                  return (
                    <DrawerClose key={item.label} asChild>
                      <Link
                        href={item.href as Route}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                          active
                            ? 'text-white bg-zinc-800/50'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                        )}
                      >
                        {item.label}
                      </Link>
                    </DrawerClose>
                  )
                })}
              </div>
            </DrawerContent>
          </Drawer> */}
        </div>
      </div>
    </nav>
  )
}

export function Header() {
  return (
    <Suspense>
      <HeaderContent />
    </Suspense>
  )
}
