'use client';

import React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  className?: string
  value?: number[]
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  onValueChange?: (val: number[]) => void
}

export function Slider({
  className,
  value,
  defaultValue = [0],
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  onValueChange,
}: SliderProps) {
  const currentValue = value ? value[0] : defaultValue[0]
  const percentage = Math.max(0, Math.min(100, ((currentValue - min) / (max - min)) * 100))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    if (onValueChange) {
      onValueChange([val])
    }
  }

  return (
    <div className={cn("relative flex w-full items-center touch-none select-none py-2", className)}>
      <div className="relative w-full h-2 rounded-full bg-secondary/80 border border-border overflow-hidden cursor-pointer">
        <div
          className="absolute top-0 left-0 h-full bg-primary transition-all rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        disabled={disabled}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-4.5 rounded-full bg-background border-2 border-primary shadow-md pointer-events-none transition-all"
        style={{ left: `${percentage}%` }}
      />
    </div>
  )
}
