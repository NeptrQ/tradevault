// Custom Progress with color support since shadcn v4 removed indicatorClassName
import * as React from "react"
import { cn } from "@/lib/utils"

interface ColorProgressProps {
  value?: number
  className?: string
  indicatorColor?: string
}

export function ColorProgress({ value = 0, className, indicatorColor = "bg-primary" }: ColorProgressProps) {
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className={cn("h-full transition-all", indicatorColor)}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  )
}
