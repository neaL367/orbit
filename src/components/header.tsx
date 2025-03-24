import Link from "next/link"
import { Search } from "@/components/search"
import { MobileNav } from "@/components/mobile-nav"

export async function Header() {

  return (
    <header className="sticky top-0 z-50 w-full flex justify-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-6">
          <MobileNav />
          <Link href="/" className="flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block text-xl">Orbit</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/anime" className="text-sm font-medium transition-colors hover:text-primary">
              Browse
            </Link>
            <Link href="/schedule" className="text-sm font-medium transition-colors hover:text-primary">
              Schedule
            </Link>
            <Link href="/genres" className="text-sm font-medium transition-colors hover:text-primary">
              Genres
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Search />
        </div>
      </div>
    </header>
  )
}

