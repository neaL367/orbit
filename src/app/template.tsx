import { Suspense } from 'react'
import { QueryProviders } from "@/lib/providers";

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <Suspense>
            <QueryProviders>{children}</QueryProviders>
        </Suspense>
    )
}
