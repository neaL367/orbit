import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist } from "next/font/google";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import Header from "@/components/header";

if (process.env.NODE_ENV !== "production") {
  loadDevMessages();
  loadErrorMessages();
}

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://orbit-eight-rosy.vercel.app"),
  title: {
    template: "%s | Orbit",
    default: "Orbit",
  },
  description:
    "Discover and explore anime with detailed information and recommendations",
  keywords: ["anime", "manga", "streaming", "reviews", "recommendations"],
  authors: [{ name: "Orbit Team" }],
  creator: "Orbit",
  publisher: "Orbit",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Orbit",
    title: {
      template: "%s | Orbit",
      default: "Orbit",
    },
    description:
      "Discover and explore anime with detailed information and recommendations",
    // images: ["/images/orbit-default-og.png"], // Default OG image path - create this image
  },
  twitter: {
    card: "summary_large_image",
    title: {
      template: "%s | Orbit",
      default: "Orbit",
    },
    description:
      "Discover and explore anime with detailed information and recommendations",
    // images: ["/images/orbit-default-og.png"], // Same default image
    creator: "@NL367", // Update with your actual Twitter handle if you have one
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "false";

  return (
    <html lang="en" suppressHydrationWarning className="dark scroll-smooth">
      <body className={geist.className}>
        <SidebarProvider defaultOpen={defaultOpen}>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col w-full dark:bg-zinc-950">
              <Header />
              <main className="mx-4 md:mx-16 sm:px-4 max-w-full ">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
