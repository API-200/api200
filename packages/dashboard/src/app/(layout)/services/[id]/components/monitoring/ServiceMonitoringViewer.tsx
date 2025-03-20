"use client"

import { CardDescription, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import type { ServiceMonitoringData } from "./getMonitoringData"


type Props = {
    data: ServiceMonitoringData | null
    isLoading?: boolean
    onRefresh: () => Promise<void>
}

export default function ServiceMonitoringViewer({ data, isLoading = false, onRefresh }: Props) {
    const handleRefresh = async () => {
        await onRefresh()
    }

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <CardTitle>Service monitoring</CardTitle>
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
                        {/*<SkeletonAverageResponseTime />*/}
                        {/*<SkeletonStatusCodeDistribution />*/}
                        {/*<SkeletonCacheHitRatio />*/}
                    </div>
                    {/*<SkeletonRequestsBarChart />*/}
                </>
            ) : data && data.endpointLatencyRanking.data.length!==0 ? (
                <>
                    {/* Data display */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/*<AverageResponseTime {...data.AverageResponseTimeProps} />*/}
                        {/*<StatusCodeDistribution {...data.StatusCodeDistributionProps} />*/}
                        {/*<CacheHitRatio {...data.CacheHitRatioProps} />*/}
                    </div>
                    {/*<RequestsBarChart {...data.RequestsBarChartProps} />*/}
                </>
            ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No data available for last 24h. Make request first.
                </div>
            )}
        </>
    )
}

