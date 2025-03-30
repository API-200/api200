"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type DateRange = "24h" | "7d" | "30d"

interface DateRangeSelectorProps {
    selectedRange: DateRange
    onChange: (range: DateRange) => void
    className?: string
}

export function DateRangeSelector({
                                      selectedRange,
                                      onChange,
                                      className
                                  }: DateRangeSelectorProps) {
    const ranges: { value: DateRange; label: string }[] = [
        { value: "24h", label: "24 hours" },
        { value: "7d", label: "7 days" },
        { value: "30d", label: "30 days" },
    ]

    return (
        <div className={cn("flex space-x-2", className)}>
            {ranges.map((range) => (
                <Button
                    key={range.value}
                    variant={selectedRange === range.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onChange(range.value)}
                >
                    {range.label}
                </Button>
            ))}
        </div>
    )
}
