"use client"

import { SWRConfig } from "swr"
import type { ReactNode } from "react"

const fetcher = (url: string) => {
  let token = ""
  if (typeof document !== "undefined") {
    token = localStorage.getItem("session_token") || ""
  }
  return fetch(url, {
    credentials: "include",
    headers: {
      "x-session-token": token,
    },
  }).then((res) => {
    if (!res.ok) throw new Error("API request failed")
    return res.json()
  })
}

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        refreshInterval: 30000,
        dedupingInterval: 2000,
        onError: (error) => {
          console.error("[v0] SWR Error:", error)
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}
