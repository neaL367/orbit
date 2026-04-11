"use client"

import DiscoveryView from "@/features/anime/components/discovery-view"

/**
 * Discovery stays client-first: infinite scroll + React Query need a living client tree.
 * A future server shell could stream static chrome + metadata, but the grid would still
 * hydrate here—document that tradeoff before splitting routes further.
 */
export function DiscoveryRouteClient() {
  return <DiscoveryView />
}
