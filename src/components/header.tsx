"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "./ui/sidebar";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full flex justify-center items-center border-b bg-sidebar backdrop-blur supports-[backdrop-filter]:bg-sidebar/90">
      <div className="w-full flex px-4 h-20  items-center justify-start">
        {/* <div className="flex items-center gap-6">
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
            <Link
              href="/schedule"
              className="text-sm transition-colors hover:text-primary"
            >
              Schedule
            </Link>
          </nav>
        </div> */}
        <SidebarTrigger className="p-7 mr-2.5" />

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search anime..."
              className="w-[200px] pl-8 md:w-[500px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </div>
    </header>
  );
}
