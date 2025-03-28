"use client"

import {CardDescription, CardTitle} from "@/components/ui/card"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {Button} from "@/components/ui/button"
import {RefreshCw} from "lucide-react"
import type {ServiceMonitoringData} from "./getMonitoringData"
import {DateRange, DateRangeSelector} from "@/components/shared/DateRangeSelector";
import EndpointLatencyRanking from "./EndpointLatencyRanking";
import {
    StatusCodeDistribution
} from "@/app/(layout)/services/[id]/endpoints/[endpointId]/components/monitoring/StatusCodeDistribution";
import {
    SkeletonStatusCodeDistribution
} from "@/app/(layout)/services/[id]/endpoints/[endpointId]/components/monitoring/skeletons/skeleton-status-code-distribution";
import {ErrorRateByEndpoint} from "@/app/(layout)/services/[id]/components/monitoring/ErrorRateByEndpoint";
import {ErrorRateBarChart} from "@/app/(layout)/services/[id]/components/monitoring/ErrorRateBarChart";
import {
    RequestsBarChart
} from "@/app/(layout)/services/[id]/endpoints/[endpointId]/components/monitoring/RequestsBarChart";
import { SkeletonRequestsBarChart } from "../../endpoints/[endpointId]/components/monitoring/skeletons/skeleton-requests-bar-chart"


type Props = {
    data: ServiceMonitoringData | null
    isLoading?: boolean
    onRefresh: () => Promise<void>
    dateRange: DateRange
    onDateRangeChange: (range: DateRange) => void
}

export default function ServiceMonitoringViewer({
                                                    data,
                                                    isLoading = false,
                                                    onRefresh,
                                                    dateRange,
                                                    onDateRangeChange
                                                }: Props) {
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
            <div className="flex justify-between items-center mb-4">
                <div>
                    <CardTitle>Service monitoring</CardTitle>
                    <CardDescription>Check the performance of the API</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                    <DateRangeSelector selectedRange={dateRange} onChange={onDateRangeChange} className="sm:mr-2"/>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
                                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}/>
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
                        <EndpointLatencyRanking.Skeleton/>
                        <ErrorRateByEndpoint.Skeleton/>
                        <SkeletonStatusCodeDistribution/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                        <ErrorRateBarChart.Skeleton/>
                        <SkeletonRequestsBarChart/>
                    </div>
                </>
            ) : data && data.EndpointLatencyRankingProps.data.length !== 0 ? (
                <>
                    {/* Data display */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <EndpointLatencyRanking {...data.EndpointLatencyRankingProps} />
                        <ErrorRateByEndpoint {...data.ErrorRateByEndpointProps} />
                        <StatusCodeDistribution {...data.StatusCodeDistributionProps} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <ErrorRateBarChart {...data.ErrorRateTrendProps}/>
                        <RequestsBarChart {...data.RequestsOverTimeProps}/>
                    </div>

                </>
            ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No data available for {getTimeRangeDescription(dateRange)}. Make request first.
                </div>
            )}
        </>
    )
}

