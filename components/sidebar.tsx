"use client"
import { useState, useEffect } from "react"
import { Plane, Activity, Clock, Settings, User, ChevronLeft, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void
}

export default function Sidebar({ onCollapsedChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { theme, resolvedTheme, mounted } = useTheme()
  const pathname = usePathname()
  const [imageError, setImageError] = useState(false)

  // Don't default to dark theme when theme is undefined
  // Only apply dark theme when we're sure it should be dark
  const isDark = mounted ? theme === "dark" || resolvedTheme === "dark" : false

  // Notify parent component when collapsed state changes
  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(collapsed)
    }
  }, [collapsed, onCollapsedChange])

  const menuItems = [
    { id: "flights", icon: Plane, label: "Flights", href: "/flights" },
    { id: "hub-operations", icon: Activity, label: "Hub Operations", href: "/hub-operations" },
    { id: "turnaround", icon: Wrench, label: "M & E Turnaround", href: "/turnaround" },
    { id: "timeline", icon: Clock, label: "Timeline", href: "/timeline" },
  ]

  // Use the appropriate logo based on theme and collapsed state
  // When collapsed, always use the icon regardless of theme
  // When expanded, use theme-specific logos
  const logoSrc = collapsed
    ? "/acLogo-icon.svg"
    : isDark
      ? "/acLogo-dark.svg"
      : imageError
        ? "/air-canada-logo.jpeg"
        : "/acLogo-light.svg"

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300",
        isDark ? "bg-black" : "bg-gray-100 border-r border-gray-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-full flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center">
              {collapsed ? (
                <div className="flex h-8 w-8 items-center justify-center">
                  <img
                    src={logoSrc || "/placeholder.svg"}
                    alt="Air Canada"
                    className="h-8 w-8 object-contain"
                    onError={() => {
                      console.log("Logo image failed to load, using fallback")
                      setImageError(true)
                    }}
                  />
                </div>
              ) : (
                <img
                  src={logoSrc || "/placeholder.svg"}
                  alt="Air Canada"
                  className="h-10 object-contain"
                  onError={() => {
                    console.log("Logo image failed to load, using fallback")
                    setImageError(true)
                  }}
                />
              )}
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn("ml-auto", isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900")}
            >
              <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed ? "rotate-180" : "")} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-8 px-2">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex w-full items-center rounded-md px-3 py-3 transition-colors",
                        isActive
                          ? isDark
                            ? "bg-gray-800 text-white"
                            : "bg-gray-200 text-gray-900"
                          : isDark
                            ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                            : "text-gray-600 hover:bg-gray-200 hover:text-gray-900",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="ml-3 text-sm font-bold">{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        {/* Bottom section */}
        <div className="mb-4 px-2">
          <Link
            href="/settings"
            className={cn(
              "flex w-full items-center rounded-md px-3 py-3 transition-colors",
              pathname === "/settings"
                ? isDark
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-900"
                : isDark
                  ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                  : "text-gray-600 hover:bg-gray-200 hover:text-gray-900",
            )}
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span className="ml-3 text-sm font-bold">Settings</span>}
          </Link>

          {/* User profile */}
          <div
            className={cn(
              "mt-4 flex items-center rounded-md px-3 py-3",
              collapsed ? "justify-center" : "justify-start",
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                isDark ? "bg-gray-700" : "bg-gray-300",
              )}
            >
              <User className={cn("h-4 w-4", isDark ? "text-gray-300" : "text-gray-700")} />
            </div>
            {!collapsed && (
              <div className="ml-3">
                <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>Mark Smith</p>
                <p className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>Operations Manager</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
