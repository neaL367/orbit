import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ReactLenis } from "lenis/react";
import { Geist } from "next/font/google";

import Header from "@/components/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import ClientOnly from "@/components/client-only";

export const experimental_ppr = true;

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orbit",
  description:
    "Discover and explore anime with detailed information and recommendations",
};

export const revalidate = 3600;
export const dynamicParams = true;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "false";

  return (
    <ReactLenis root>
      <html lang="en" suppressHydrationWarning className="dark">
        <body className={geist.className}>
          <SidebarProvider defaultOpen={defaultOpen}>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col w-full  dark:bg-zinc-950">
                <Header />
                <main className="mx-4 md:mx-16 sm:px-4 max-w-full">
                  <ClientOnly>{children}</ClientOnly>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </body>
      </html>
    </ReactLenis>
  );
}
