"use client"

import { createContext, useContext, ReactNode } from "react"

type AmbientColors = {
    leftTop: string
    rightTop: string
    leftBottom: string
    rightBottom: string
}

type AmbientContextType = {
    colors: AmbientColors | null
}

const AmbientContext = createContext<AmbientContextType>({
    colors: null
})

export function AmbientProvider({
    children,
    colors
}: {
    children: ReactNode
    colors: AmbientColors | null
}) {
    return (
        <AmbientContext.Provider value={{ colors }}>
            {children}
        </AmbientContext.Provider>
    )
}

export function useAmbient() {
    return useContext(AmbientContext)
}
