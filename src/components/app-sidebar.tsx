"use client"

import { usePathname } from "next/navigation"
import { Link } from "next-view-transitions"
import { Home, TrendingUp, List, CalendarDays, Clock, Orbit } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Trending",
    url: "/trending",
    icon: TrendingUp,
  },
  {
    title: "Genres",
    url: "/genres",
    icon: List,
  },
  {
    title: "Seasonal",
    url: "/seasonal",
    icon: CalendarDays,
  },
  {
    title: "Schedule",
    url: "/schedule",
    icon: Clock,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-gray-800">
      {/* Sidebar Header */}
      <SidebarHeader className="py-6 hover:bg-gradient-to-r hover:from-primary/5 hover:to-purple-400/5 transition-all">
        <div className="flex items-center justify-center gap-2 px-4">
          <Orbit className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            <Link href="/">Orbit</Link>
          </span>
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-400 px-6 mb-2">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url))

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`group flex items-center gap-3 mx-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-primary hover:to-purple-400"
                        }`}
                      >
                        <item.icon
                          className={`h-4.5 w-4.5 ${isActive ? "text-primary" : "group-hover:text-white transition-colors"}`}
                        />
                        <span>{item.title}</span>
                        {isActive && (
                          <div className="absolute left-0 w-1 h-5 bg-gradient-to-b from-primary to-purple-400 rounded-r-full"></div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Additional Categories Section */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-semibold text-gray-400 px-6 mb-2">
            Popular Categories
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-6 py-2 flex flex-wrap gap-2">
              {["Action", "Romance", "Comedy", "Fantasy", "Sci-Fi", "Slice of Life"].map((genre) => (
                <Link
                  key={genre}
                  href={`/genres/${genre}`}
                  className="px-2.5 py-1 text-xs rounded-full bg-gray-800 text-gray-300 hover:bg-gradient-to-r hover:from-primary hover:to-purple-400 hover:text-white transition-all"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t border-gray-800 hover:bg-gradient-to-r hover:from-primary/5 hover:to-purple-400/5 transition-all">
        <div className="px-6 py-4 text-xs text-gray-400">
          <p>© 2025 Orbit</p>
          <p className="mt-1 text-gray-500">
            Powered by{" "}
            <a
              href="https://anilist.co"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              AniList
            </a>
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

