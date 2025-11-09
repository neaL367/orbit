import { QueryProviders } from "./_components/providers";

export default function Template({ children }: { children: React.ReactNode }) {
    return <QueryProviders>{children}</QueryProviders>
}