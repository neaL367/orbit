"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-7">
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <span className="font-bold">AniTrack</span>
          </Link>
        </div>
        <div className="flex flex-col gap-3 mt-8">
          <Link
            href="/anime"
            className="px-7 py-2 text-lg font-medium hover:bg-accent hover:text-accent-foreground"
            onClick={() => setOpen(false)}
          >
            Browse
          </Link>
          <Link
            href="/schedule"
            className="px-7 py-2 text-lg font-medium hover:bg-accent hover:text-accent-foreground"
            onClick={() => setOpen(false)}
          >
            Schedule
          </Link>
          <Link
            href="/genres"
            className="px-7 py-2 text-lg font-medium hover:bg-accent hover:text-accent-foreground"
            onClick={() => setOpen(false)}
          >
            Genres
          </Link>
          <Link
            href="/sign-in"
            className="px-7 py-2 text-lg font-medium hover:bg-accent hover:text-accent-foreground"
            onClick={() => setOpen(false)}
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-7 py-2 text-lg font-medium hover:bg-accent hover:text-accent-foreground"
            onClick={() => setOpen(false)}
          >
            Sign Up
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}

