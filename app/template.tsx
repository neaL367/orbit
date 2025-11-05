import { QueryProviders } from "@/features/shared";

export default function Template({ children }: { children: React.ReactNode }) {
    return <QueryProviders>{children}</QueryProviders>
}