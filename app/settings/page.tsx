"use client"

import { Suspense } from "react"
import SettingsView from "@/components/settings-view"

function SettingsContent() {
  return (
    <div className="flex-1 h-full">
      <SettingsView />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
      <SettingsContent />
    </Suspense>
  )
}
