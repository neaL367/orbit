import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist } from "next/font/google";
import Header from "@/components/header";
import { AppSidebar } from "@/components/app-sidebar";
import ClientWrapper from "@/components/client-wrapper";

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
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={geist.className}>
        <ClientWrapper defaultOpen={defaultOpen}>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col w-full dark:bg-zinc-950">
              <Header />
              <main className="mx-4 md:mx-16 sm:px-4 max-w-full">
                {children}
              </main>
            </div>
          </div>
        </ClientWrapper>
      </body>
    </html>
  );
}
