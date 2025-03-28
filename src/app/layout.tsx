import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";

import Header from "@/components/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ReactLenis } from "lenis/react";

export const experimental_ppr = true;

const geist_Mono = Geist_Mono({
  variable: "--font-geist-mono",
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
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "false";

  return (
    <ViewTransitions>
      <ReactLenis root>
        <html lang="en" suppressHydrationWarning className="dark">
          <body className={geist_Mono.className}>
            <SidebarProvider defaultOpen={defaultOpen}>
              <div className="flex min-h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col w-full  dark:bg-zinc-950">
                  <Header />
                  <main className="mx-4 md:mx-16 px-4 max-w-full">
                    {children}
                  </main>
                </div>
              </div>
            </SidebarProvider>
          </body>
        </html>
      </ReactLenis>
    </ViewTransitions>
  );
}
