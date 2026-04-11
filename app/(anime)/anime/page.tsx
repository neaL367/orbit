import { Suspense } from "react"
import type { Metadata } from "next"
import { DiscoveryRouteClient } from "./_components/discovery-route-client"

export const metadata: Metadata = {
  title: "Discovery Registry — Database Exploration",
  description:
    "Filter and explore the global anime archive. Search through thousands of entries by genre, season, year, and format.",
  alternates: {
    canonical: "/anime",
  },
}

export default function DiscoveryPage() {
  return (
    <Suspense fallback={<div className="h-dvh w-full shimmer" />}>
      <DiscoveryRouteClient />
    </Suspense>
  )
}
