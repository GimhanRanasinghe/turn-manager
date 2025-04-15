"use client"

import { Suspense } from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

function TimelineContent() {
  const { theme, resolvedTheme } = useTheme()
  const isDark = theme === "dark" || resolvedTheme === "dark"

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full p-8">
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-4",
          isDark ? "bg-gray-800" : "bg-gray-100",
        )}
      >
        <Clock className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Timeline View</h3>
      <p className="text-muted-foreground text-center max-w-md">
        The timeline feature is currently under development and will be available in a future update.
      </p>
    </div>
  )
}

export default function TimelinePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
      <TimelineContent />
    </Suspense>
  )
}
