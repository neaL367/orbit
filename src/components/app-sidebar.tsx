"use client";

import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";
import {
  Home,
  TrendingUp,
  List,
  CalendarDays,
  Clock,
  Orbit,
  Trophy,
  Star,
} from "lucide-react";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";

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
    title: "All Time Popular",
    url: "/all-time-popular",
    icon: Star,
  },
  {
    title: "Top 100",
    url: "/top-100-anime",
    icon: Trophy,
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
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-zinc-800" collapsible="icon">
      {/* Sidebar Header */}
      <SidebarHeader className="py-6 bg-zinc-950 transition-all">
        <div className="flex items-center justify-between sm:justify-center gap-2 px-4 overflow-hidden">
          <div className="flex gap-2 items-center">
            <Orbit className=" h-6 w-6 text-white group-data-[collapsible=icon]:ml-[4.2rem] shrink-0 " />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent truncate group-data-[collapsible=icon]:opacity-0 transition-opacity duration-200">
              <Link href="/">Orbit</Link>
            </span>
          </div>
          <SidebarTrigger className="flex sm:hidden" />
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="bg-zinc-950 max-sm:overflow-y-scroll">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-400 px-7 mb-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/" && pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link
                        prefetch={false}
                        href={item.url}
                        className={`h-12 group flex items-center gap-3 group-data-[collapsible=icon]:ml-0 ml-3.5 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-r from-primary/30 to-purple-400/30 text-white font-medium"
                            : "text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-primary hover:to-purple-400 duration-300 transition-all"
                        }`}
                      >
                        <item.icon className="shrink-0 stroke-current transition-all duration-300" />
                        <span className="truncate">{item.title}</span>
                        {isActive && (
                          <div className="group-data-[collapsible=icon]:hidden absolute -left-1 top-0.5 w-1 h-10 bg-gradient-to-b from-primary to-purple-400 rounded-r-full"></div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Additional Categories Section - Hide completely in icon mode */}
        <SidebarGroup className="mt-6 group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="text-xs font-semibold text-gray-400 px-7 mb-2">
            Popular Categories
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-7 py-2 flex flex-wrap gap-2">
              {[
                "Action",
                "Romance",
                "Comedy",
                "Fantasy",
                "Sci-Fi",
                "Slice of Life",
              ].map((genre) => (
                <Link
                  key={genre}
                  href={`/genres/${genre}`}
                  className="px-2.5 py-1 text-xs border hover:border-0 rounded-full bg-zinc-800 text-gray-300 hover:bg-gradient-to-r hover:from-primary hover:to-purple-400 hover:text-white transition-all"
                >
                  {genre}
                </Link>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="border-t border-zincbg-zinc-800 bg-zinc-950 transition-all">
        <div className="px-6 py-4 text-xs text-gray-400 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:text-center">
          <p className="truncate group-data-[collapsible=icon]:opacity-0">
            © 2025 Orbit
          </p>
          <p className="mt-1 text-gray-500 group-data-[collapsible=icon]:hidden">
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
  );
}
