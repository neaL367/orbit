import { QueryProviders } from "@/features/shared/query-providers";

export default function Template({ children }: { children: React.ReactNode }) {
    return <QueryProviders>{children}</QueryProviders>
}