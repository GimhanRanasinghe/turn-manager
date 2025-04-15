"use client"

import { useState } from "react"
import { User, Palette, Database } from "lucide-react"
import { useTheme } from "next-themes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function SettingsView() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [activeSection, setActiveSection] = useState<"account" | "appearance" | "data">("appearance")
  const isDark = theme === "dark" || resolvedTheme === "dark"

  return (
    <div className="flex h-full">
      {/* Settings sidebar */}
      <div
        className={cn(
          "w-64 p-6 flex flex-col border-r",
          isDark ? "bg-black border-gray-800" : "bg-gray-100 border-gray-200",
        )}
      >
        <h1 className={cn("text-2xl font-bold mb-8", isDark ? "text-white" : "text-gray-900")}>Settings</h1>

        <nav className="space-y-1 flex-1">
          <button
            onClick={() => setActiveSection("account")}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 rounded-md text-left",
              activeSection === "account"
                ? isDark
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-900"
                : isDark
                  ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                  : "text-gray-600 hover:bg-gray-200 hover:text-gray-900",
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
                ? isDark
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-900"
                : isDark
                  ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                  : "text-gray-600 hover:bg-gray-200 hover:text-gray-900",
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
                ? isDark
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-900"
                : isDark
                  ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                  : "text-gray-600 hover:bg-gray-200 hover:text-gray-900",
            )}
          >
            <Database size={18} />
            <span>Data</span>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 bg-background">
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
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
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
  )
}
