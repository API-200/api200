"use client"

import { AverageResponseTime } from "./AverageResponseTime"
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
import { DateRangeSelector, type DateRange } from "@/components/shared/DateRangeSelector"

type Props = {
    data: MonitoringData | null
    isLoading?: boolean
    onRefresh: () => Promise<void>
    dateRange: DateRange
    onDateRangeChange: (range: DateRange) => void
}

export default function MonitoringViewer({ data, isLoading = false, onRefresh, dateRange, onDateRangeChange }: Props) {
    const handleRefresh = async () => {
        await onRefresh()
    }

    // Helper function to get description based on date range
    const getTimeRangeDescription = (range: DateRange) => {
        switch (range) {
            case "24h":
                return "Last 24 hours"
            case "7d":
                return "Last 7 days"
            case "30d":
                return "Last 30 days"
            default:
                return "Last 24 hours"
        }
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div>
                    <CardTitle>Endpoint monitoring</CardTitle>
                    <CardDescription>Check the performance of the API</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                    <DateRangeSelector selectedRange={dateRange} onChange={onDateRangeChange} className="sm:mr-2" />
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
            ) : data && data.AverageResponseTimeProps.averageTime !== 0 ? (
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
                    No data available for {getTimeRangeDescription(dateRange)}. Make request first.
                </div>
            )}
        </>
    )
}

