"use client"

import React, { createContext, useContext } from "react"
import { usePrecisionPlayer } from "./use-precision-player"

type PrecisionPlayerValue = ReturnType<typeof usePrecisionPlayer>
type PrecisionPlayerState = PrecisionPlayerValue["state"]
type PrecisionPlayerHandlers = PrecisionPlayerValue["handlers"]
type PrecisionPlayerRefs = PrecisionPlayerValue["refs"]

const StateContext = createContext<PrecisionPlayerState | null>(null)
const HandlersContext = createContext<PrecisionPlayerHandlers | null>(null)
const RefsContext = createContext<PrecisionPlayerRefs | null>(null)

export function PrecisionPlayerProvider({
    children,
    url,
    videoId,
    title,
    id,
    autoPlay,
}: {
    children: React.ReactNode
    url?: string
    videoId?: string
    title?: string
    id?: string
    autoPlay?: boolean
}) {
    const { state, handlers, refs } = usePrecisionPlayer({ url, videoId, title, id, autoPlay })

    return (
        <RefsContext.Provider value={refs}>
            <HandlersContext.Provider value={handlers}>
                <StateContext.Provider value={state}>
                    {children}
                </StateContext.Provider>
            </HandlersContext.Provider>
        </RefsContext.Provider>
    )
}

export function usePrecisionPlayerState() {
    const context = useContext(StateContext)
    if (!context) throw new Error("usePrecisionPlayerState must be used within Provider")
    return context
}

export function usePrecisionPlayerHandlers() {
    const context = useContext(HandlersContext)
    if (!context) throw new Error("usePrecisionPlayerHandlers must be used within Provider")
    return context
}

export function usePrecisionPlayerRefs() {
    const context = useContext(RefsContext)
    if (!context) throw new Error("usePrecisionPlayerRefs must be used within Provider")
    return context
}
