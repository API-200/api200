"use client"

import {useEffect, useState} from 'react';
import type {Tables} from "@/utils/supabase/database.types";
import type {DateRange} from "@/components/shared/DateRangeSelector";
import {getServiceMonitoringData, ServiceMonitoringData} from '@/components/widgets/getServiceMonitoringData';
import {CardDescription, CardTitle} from "@/components/ui/card";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {RefreshCw} from "lucide-react";
import {DateRangeSelector} from "@/components/shared/DateRangeSelector";
import {StatusCodeDistribution} from "@/components/widgets/StatusCodeDistribution";
import {SkeletonStatusCodeDistribution} from "@/components/widgets/skeletons/skeleton-status-code-distribution";
import {ErrorRateByEndpoint} from "@/components/widgets/ErrorRateByEndpoint";
import {ErrorRateBarChart} from "@/components/widgets/ErrorRateBarChart";
import {RequestsBarChart} from "@/components/widgets/RequestsBarChart";
import {SkeletonRequestsBarChart} from "@/components/widgets/skeletons/skeleton-requests-bar-chart";
import EndpointLatencyRanking from "@/components/widgets/EndpointLatencyRanking";

type Props = {
    endpoints: Tables<"endpoints">[]
};

export default function ServiceMonitoring({endpoints}: Props) {
    const [data, setData] = useState<ServiceMonitoringData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange>("24h");

    const refreshData = async () => {
        setIsLoading(true);
        try {
            const freshData = await getServiceMonitoringData(endpoints, dateRange);
            setData(freshData);
        } catch (error) {
            console.error("Failed to refresh service monitoring data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, [dateRange]);

    const handleDateRangeChange = (newRange: DateRange) => {
        setDateRange(newRange);
    };

    const getTimeRangeDescription = (range: DateRange) => {
        switch (range) {
            case "24h": return "Last 24 hours";
            case "7d": return "Last 7 days";
            case "30d": return "Last 30 days";
            default: return "Last 24 hours";
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <CardTitle>Service monitoring</CardTitle>
                    <CardDescription>Check the performance of the API</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                    <DateRangeSelector selectedRange={dateRange} onChange={handleDateRangeChange} className="sm:mr-2"/>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={refreshData} disabled={isLoading}>
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
    );
}
