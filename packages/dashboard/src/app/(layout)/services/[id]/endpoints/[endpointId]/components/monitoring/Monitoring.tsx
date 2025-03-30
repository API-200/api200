"use client"

import { useState, useEffect } from "react"
import type { Tables } from "@/utils/supabase/database.types"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { SkeletonAverageResponseTime } from "@/components/widgets/skeletons/skeleton-average-response-time"
import { SkeletonStatusCodeDistribution } from "@/components/widgets/skeletons/skeleton-status-code-distribution"
import { SkeletonCacheHitRatio } from "@/components/widgets/skeletons/skeleton-cache-hit-ratio"
import { SkeletonRequestsBarChart } from "@/components/widgets/skeletons/skeleton-requests-bar-chart"
import { DateRangeSelector, type DateRange } from "@/components/shared/DateRangeSelector"
import { AverageResponseTime } from "@/components/widgets/AverageResponseTime"
import { StatusCodeDistribution } from "@/components/widgets/StatusCodeDistribution"
import { RequestsBarChart } from "@/components/widgets/RequestsBarChart"
import { CacheHitRatio } from "@/components/widgets/CacheHitRatio"
import { getEndpointMonitoringData, MonitoringData } from "@/components/widgets/getEndpointMonitoringData"

type Props = {
    endpoint: Tables<"endpoints">
}

export default function EndpointMonitoring({ endpoint }: Props) {
    const [data, setData] = useState<MonitoringData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [dateRange, setDateRange] = useState<DateRange>("24h")

    const refreshData = async () => {
        setIsLoading(true)
        try {
            const freshData = await getEndpointMonitoringData(endpoint, dateRange)
            setData(freshData)
        } catch (error) {
            console.error("Failed to refresh monitoring data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        refreshData()
    }, [dateRange])

    const handleDateRangeChange = (newRange: DateRange) => {
        setDateRange(newRange)
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div>
                    <CardTitle>Endpoint monitoring</CardTitle>
                    <CardDescription>Check the performance of the API</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                    <DateRangeSelector selectedRange={dateRange} onChange={handleDateRangeChange} className="sm:mr-2" />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={refreshData} disabled={isLoading}>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <SkeletonAverageResponseTime />
                        <SkeletonStatusCodeDistribution />
                        <SkeletonCacheHitRatio />
                    </div>
                    <SkeletonRequestsBarChart />
                </>
            ) : data && data.AverageResponseTimeProps.averageTime !== 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <AverageResponseTime {...data.AverageResponseTimeProps} />
                        <StatusCodeDistribution {...data.StatusCodeDistributionProps} />
                        <CacheHitRatio {...data.CacheHitRatioProps} />
                    </div>
                    <RequestsBarChart {...data.RequestsBarChartProps} />
                </>
            ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No data available for {dateRange}. Make request first.
                </div>
            )}
        </>
    )
}
