"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useTransitionRouter } from "next-view-transitions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon, X } from "lucide-react"

export function Search() {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const router = useTransitionRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setIsOpen(false)
      setQuery("")
    }
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(true)}>
        <SearchIcon className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </Button>
      <div className={`hidden md:block ${isOpen ? "w-80" : "w-64"} transition-all duration-300`}>
        <form onSubmit={handleSubmit} className="relative">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search anime..."
            className="pl-8 pr-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </form>
      </div>
      {isOpen && (
        <div className="fixed mx-3.5 inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="container flex h-16 items-center">
            <form onSubmit={handleSubmit} className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="search"
                placeholder="Search anime..."
                className="pl-8 pr-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => {
                  setQuery("")
                  setIsOpen(false)
                }}
              >
                {/* <X className="h-4 w-4" /> */}
                <span className="sr-only">Clear</span>
              </Button>
            </form>
            <Button variant="ghost" size="icon" className="ml-2" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

