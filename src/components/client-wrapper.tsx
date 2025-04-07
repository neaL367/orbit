"use client";

import { ApolloProvider } from "@apollo/client";
import { ReactLenis } from "lenis/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { client } from "@/app/services/apollo-client";

export default function ClientWrapper({
  children,
  defaultOpen,
}: {
  children: React.ReactNode;
  defaultOpen: boolean;
}) {
  return (
    <ApolloProvider client={client}>
      <ReactLenis root>
        <SidebarProvider defaultOpen={defaultOpen}>{children}</SidebarProvider>
      </ReactLenis>
    </ApolloProvider>
  );
}
