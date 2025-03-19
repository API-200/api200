"use client"

import { AverageResponseTime } from "./AverageResponseType"
import { CacheHitRatio } from "./CacheHitRatio"
import { RequestsBarChart } from "./RequestsBarChart"
import { StatusCodeDistribution } from "./StatusCodeDistribution"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import type { MonitoringData } from "./getMonitoringData"
import { SkeletonAverageResponseTime } from "./skeletons/skeleton-average-response-time"
import { SkeletonStatusCodeDistribution } from "./skeletons/skeleton-status-code-distribution"
import { SkeletonCacheHitRatio } from "./skeletons/skeleton-cache-hit-ratio"
import { SkeletonRequestsBarChart } from "./skeletons/skeleton-requests-bar-chart"

type Props = {
    data: MonitoringData | null
    isLoading?: boolean
    onRefresh: () => Promise<void>
}

export default function MonitoringViewer({ data, isLoading = false, onRefresh }: Props) {
    const handleRefresh = async () => {
        await onRefresh()
    }

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <CardTitle>Endpoint monitoring</CardTitle>
                    <CardDescription>Check the performance of the API</CardDescription>
                </div>
                <div className="flex space-x-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
                                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                                    <span className="sr-only">Refresh</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Refresh</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {isLoading ? (
                <>
                    {/* Skeleton loading state */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <SkeletonAverageResponseTime />
                        <SkeletonStatusCodeDistribution />
                        <SkeletonCacheHitRatio />
                    </div>
                    <SkeletonRequestsBarChart />
                </>
            ) : data ? (
                <>
                    {/* Data display */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <AverageResponseTime {...data.AverageResponseTimeProps} />
                        <StatusCodeDistribution {...data.StatusCodeDistributionProps} />
                        <CacheHitRatio {...data.CacheHitRatioProps} />
                    </div>
                    <RequestsBarChart {...data.RequestsBarChartProps} />
                </>
            ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No monitoring data available. Click refresh to load data.
                </div>
            )}
        </>
    )
}

