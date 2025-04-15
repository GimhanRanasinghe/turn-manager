"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { theme, resolvedTheme } = useTheme()
  const isLightTheme = theme === "light" || resolvedTheme === "light"

  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      className={cn(
        "inline-flex rounded-md p-1 items-center justify-center gap-1",
        isLightTheme ? "bg-gray-200" : "bg-gray-800",
        className,
      )}
      {...props}
    />
  )
})
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const { theme, resolvedTheme } = useTheme()
  const isLightTheme = theme === "light" || resolvedTheme === "light"

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isLightTheme
          ? "data-[state=on]:bg-blue-600 data-[state=on]:text-white"
          : "data-[state=on]:bg-blue-600 data-[state=on]:text-white",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
