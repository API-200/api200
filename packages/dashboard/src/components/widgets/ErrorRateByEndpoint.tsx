"use client"

import { AlertTriangle, ArrowDown, ArrowUp, Server } from "lucide-react"
import { useMemo } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {MethodBadge} from "@/components/MethodBadge";

export interface ErrorRateByEndpointProps {
    data: {
        endpoint: string
        method: string
        endpointId: number
        totalRequests: number
        errorCount: number
        errorRate: number
    }[]
}

export function ErrorRateByEndpoint({ data }: ErrorRateByEndpointProps) {
    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => b.errorRate - a.errorRate)
    }, [data])

    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <CardTitle>Error Rate by Endpoint</CardTitle>
                <CardDescription>Comparison of error rates across endpoints</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    {sortedData.map((item) => (
                        <div key={item.endpointId} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <MethodBadge method={item.method}/>
                                    <span
                                        className="text-muted-foreground truncate max-w-[200px] sm:max-w-[300px]">{item.endpoint}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{item.errorRate.toFixed(0)}%</span>
                                    {item.errorRate > 0 && (
                                        <div
                                            className={cn(
                                                "flex items-center gap-0.5",
                                                item.errorRate >= 50 ? "text-destructive" : "text-amber-500",
                                            )}
                                        >
                                            {item.errorRate >= 50 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Progress
                                    value={item.errorRate}
                                    className={cn(
                                        "h-2",
                                        item.errorRate >= 75 ? "bg-destructive/20" : "bg-muted",
                                        item.errorRate >= 75
                                            ? "[&>div]:bg-destructive"
                                            : item.errorRate >= 50
                                                ? "[&>div]:bg-amber-500"
                                                : "[&>div]:bg-amber-400",
                                    )}
                                />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {item.errorCount}/{item.totalRequests} requests
                </span>
                            </div>
                        </div>
                    ))}

                    {sortedData.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <Server className="h-10 w-10 text-muted-foreground/60" />
                            <h3 className="mt-4 text-sm font-medium">No endpoint data available</h3>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Endpoint data will appear here once requests are processed.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

// Skeleton loader for the widget
ErrorRateByEndpoint.Skeleton = function ErrorRateByEndpointSkeleton() {
    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="mt-2 h-4 w-64" />
                    </div>
                    <Skeleton className="h-5 w-5 rounded-full" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-7 w-16 rounded" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <Skeleton className="h-4 w-12" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-2 w-full rounded" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
