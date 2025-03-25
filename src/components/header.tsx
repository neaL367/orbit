"use client";

import type React from "react";

import { Link } from "next-view-transitions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [router]);

  return (
    <header className="sticky top-0 z-50 w-full flex justify-center items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex px-4 h-20 items-center justify-between">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            className="md:hidden"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">Orbit</span>
          </Link>
          <nav
            className={`${
              isMenuOpen
                ? "absolute left-0 top-16 z-50 flex w-full flex-col border-b bg-background p-4 md:static md:w-auto md:border-none md:bg-transparent md:p-0"
                : "hidden md:flex"
            } items-center gap-6`}
          >
            <Link
              href="/trending"
              className="text-sm transition-colors hover:text-primary"
            >
              Trending
            </Link>
            <Link
              href="/genres"
              className="text-sm transition-colors hover:text-primary"
            >
              Genres
            </Link>
            <Link
              href="/seasonal"
              className="text-sm transition-colors hover:text-primary"
            >
              Seasonal
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search anime..."
              className="w-[200px] pl-8 md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </div>

      {/* Mobile search */}
      <div className="border-t p-2 md:hidden">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search anime..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
    </header>
  );
}
