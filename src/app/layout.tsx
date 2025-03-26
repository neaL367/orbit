import type { Metadata } from "next";
import { cookies } from "next/headers"; 
import { Geist } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import "./globals.css";

import { SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orbit",
  description:
    "Discover and explore anime with detailed information and recommendations",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // If you want to persist sidebar open/close state across reloads:
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning className="dark">
        <body className={geistSans.className}>
          <SidebarProvider defaultOpen={defaultOpen}>
            {/* Page Layout: sidebar on the left, main content to the right */}
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              {/* Right section: top Header + main content */}
              <div className="flex flex-col w-full">
                {/* Optional: a button to toggle sidebar (mobile) */}
                {/* <SidebarTrigger className="p-6" /> */}

                {/* Your existing top search bar / nav */}
                <Header />

                {/* Main content area */}
                <main className="mx-8 md:mx-16 px-4 max-w-full">{children}</main>
              </div>
            </div>
          </SidebarProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
