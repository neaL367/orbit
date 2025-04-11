"use client"

import { ApolloProvider } from "@apollo/client";
import { Client } from "@/lib/apollo-client";

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApolloProvider client={Client}>{children}</ApolloProvider>;
}
