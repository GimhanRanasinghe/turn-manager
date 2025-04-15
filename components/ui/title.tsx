import type React from "react"
import { cn } from "@/lib/utils"

interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl"
}

const sizeClasses = {
  xs: "text-lg",
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
  "2xl": "text-5xl",
  "3xl": "text-6xl",
  "4xl": "text-7xl",
}

export function Title({ as: Component = "h2", size = "lg", className, children, ...props }: TitleProps) {
  return (
    <Component className={cn("font-title font-semibold tracking-tight", sizeClasses[size], className)} {...props}>
      {children}
    </Component>
  )
}
