"use client";

import { Link } from "next-view-transitions";
import { Home, TrendingUp, List, CalendarDays, Clock } from "lucide-react";
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
  return (
    <Sidebar>
      {/* Sidebar Header */}
      <SidebarHeader>
        <div className="px-4 py-2 text-xl font-bold">
          <Link href="/">Orbit</Link>
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter>
        <div className="px-4 py-2 text-xs">
          <p className="opacity-50">© 2025 Orbit</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
