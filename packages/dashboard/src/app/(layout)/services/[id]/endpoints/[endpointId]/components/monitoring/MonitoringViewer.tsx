"use client"

import {AverageResponseTime} from "./AverageResponseType"
import {CacheHitRatio} from "./CacheHitRatio"
import {RequestsBarChart} from "./RequestsBarChart";
import {StatusCodeDistribution} from "./StatusCodeDistribution";
import {CardDescription, CardTitle} from "@/components/ui/card";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {RefreshCw} from "lucide-react";
import {MonitoringData} from "./getMonitoringData";

type Props = {
    data: MonitoringData
}

export default function MonitoringViewer({data}: Props) {

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
                                <Button variant="outline" size="icon" onClick={() => null}>
                                    <RefreshCw className="h-4 w-4"/>
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
            <div>
                {/* First row with 3 widgets */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <AverageResponseTime {...data.AverageResponseTimeProps} />
                    <StatusCodeDistribution {...data.StatusCodeDistributionProps}/>
                    <CacheHitRatio {...data.CacheHitRatioProps} />
                </div>

                {/* Second row with request volume bar chart */}
                <RequestsBarChart {...data.RequestsBarChartProps}/>
            </div>
        </>
    )
}

