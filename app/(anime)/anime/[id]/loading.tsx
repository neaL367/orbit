"use client"

import { useSyncExternalStore } from 'react'

export default function Loading() {
    const mounted = useSyncExternalStore(
        () => () => { },
        () => true,
        () => false
    )

    if (!mounted) return null

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-background pointer-events-none reveal">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div className="flex flex-col items-center gap-12 relative z-10 scale-90 sm:scale-100">
                {/* Core Oracle Node */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Scanning Rings */}
                    <div className="absolute inset-0 border border-primary/20 rotate-45 animate-[spin_8s_linear_infinite]" />
                    <div className="absolute inset-2 border border-primary/10 -rotate-45 animate-[spin_12s_linear_infinite_reverse]" />

                    {/* Pulsing Core */}
                    <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin transition-all duration-1000" />
                    <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse blur-2xl" />

                    {/* Orbital Satellites */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rotate-45 shadow-[0_0_15px_var(--primary)]" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary/40 rotate-45" />
                </div>

                {/* Telemetry Stream */}
                <div className="flex flex-col items-center gap-4 font-mono text-center">
                    <div className="space-y-1">
                        <span className="block text-sm uppercase tracking-[0.8em] text-primary font-black animate-pulse">
                            Uplink_Initializing
                        </span>
                        <div className="h-0.5 w-0 bg-primary animate-[shimmer_2s_ease-in-out_infinite] mx-auto opacity-50" />
                    </div>

                    <div className="flex flex-col gap-1 items-center">
                        <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 font-bold">
                            Downloading_Node_Registry_0x7F
                        </span>
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="w-1 h-1 bg-primary/20 animate-pulse"
                                    style={{ animationDelay: `${i * 200}ms` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Loading Progress Simulation */}
                <div className="absolute -bottom-24 w-64 h-px bg-white/5 overflow-hidden">
                    <div className="h-full bg-primary/40 w-1/2 animate-[load_2s_ease-in-out_infinite]" />
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { width: 0; opacity: 0; }
                    50% { width: 100%; opacity: 0.5; }
                    100% { width: 0; opacity: 0; }
                }
                @keyframes load {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .reveal {
                    animation: reveal 0.8s cubic-bezier(0.2, 0, 0, 1) forwards;
                }
                @keyframes reveal {
                    0% { opacity: 0; filter: blur(10px); }
                    100% { opacity: 1; filter: blur(0); }
                }
            `}</style>
        </div>
    )
}
