"use client";

import type React from "react";

import { useEffect, useState } from "react";

interface ClientOnlyProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Component that only renders its children on the client side
 * This prevents hydration errors when using Apollo Client hooks
 */
export default function ClientOnly({
  children,
  ...delegated
}: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <div {...delegated}>{children}</div>;
}
