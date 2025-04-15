"use client"

import { useState } from "react"
import { User, Palette, Database, X } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface SettingsPageProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsPage({ isOpen, onClose }: SettingsPageProps) {
  const { theme, setTheme } = useTheme()
  const [activeSection, setActiveSection] = useState<"account" | "appearance" | "data">("appearance")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-background text-foreground w-[800px] h-[600px] rounded-lg flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-black p-6 flex flex-col">
          <h1 className="text-2xl font-bold mb-8">Settings</h1>

          <nav className="space-y-1 flex-1">
            <button
              onClick={() => setActiveSection("account")}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-md text-left",
                activeSection === "account"
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
              )}
            >
              <User size={18} />
              <span>Account</span>
            </button>

            <button
              onClick={() => setActiveSection("appearance")}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-md text-left",
                activeSection === "appearance"
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
              )}
            >
              <Palette size={18} />
              <span>Appearance</span>
            </button>

            <button
              onClick={() => setActiveSection("data")}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-md text-left",
                activeSection === "data"
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
              )}
            >
              <Database size={18} />
              <span>Data</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 relative">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={onClose}>
            <X size={18} />
          </Button>

          {activeSection === "account" && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Account</h2>
              <p className="text-muted-foreground">Account settings will be available in a future update.</p>
            </div>
          )}

          {activeSection === "appearance" && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Appearance</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-4">Theme Preferences</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">Color Mode</label>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "data" && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Data</h2>
              <p className="text-muted-foreground">Data settings will be available in a future update.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
