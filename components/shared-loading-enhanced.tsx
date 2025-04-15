import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SharedLoadingProps {
  message?: string
  className?: string
  icon?: boolean
}

export default function SharedLoadingEnhanced({ message = "Loading...", className, icon = true }: SharedLoadingProps) {
  return (
    <div className={cn("flex-1 flex items-center justify-center h-full", className)}>
      <div className="text-center flex flex-col items-center gap-2">
        {icon && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
