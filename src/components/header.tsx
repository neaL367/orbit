"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "./ui/sidebar";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.prefetch(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Add a subtle animation effect when the component mounts
  useEffect(() => {
    const header = document.getElementById("main-header");
    if (header) {
      header.classList.add("animate-fadeIn");
    }
  }, []);

  return (
    <header
      id="main-header"
      className="sticky top-0 z-50 w-full flex justify-center items-center bg-zinc-950/50 backdrop-blur-xl  transition-all duration-300 hover:shadow-md"
    >
      <div className="w-full flex px-4 h-20 items-center justify-start">
        <SidebarTrigger className="p-7 mr-2.5 hover:cursor-pointer rounded-lg transition-all" />

        <div className="flex items-center gap-4 flex-1">
          <form
            onSubmit={handleSearch}
            className="relative w-full max-w-[500px]"
          >
            <div
              className={`absolute left-0 top-0 bottom-0 flex items-center justify-center w-10 transition-colors ${
                isFocused ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Search className="h-4 w-4" />
            </div>
            <Input
              type="search"
              placeholder="Search anime..."
              className={`w-full pl-10 pr-10 border transition-all duration-300 ${
                isFocused
                  ? "border-primary/50 shadow-sm shadow-primary/20 bg-gradient-to-r from-primary/5 to-purple-400/5"
                  : "hover:border-primary/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-purple-400/5"
              }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary hover:bg-transparent"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </form>
        </div>
      </div>
    </header>
  );
}
