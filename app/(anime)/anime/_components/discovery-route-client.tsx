"use client"

import DiscoveryView from "@/features/anime/components/discovery-view"

/**
 * Discovery client island: URL-driven filters + infinite scroll (React Query).
 * Default `sort=trending` is enforced on the server in `app/(anime)/anime/page.tsx` so this
 * tree never renders a blank shell waiting for a client-side redirect.
 */
export function DiscoveryRouteClient() {
  return <DiscoveryView />
}
