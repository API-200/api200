"use client"

import {BarChartIcon as Bar} from "lucide-react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {EndpointLatencyRankingProps} from "./getMonitoringData"
import {formatRequestDuration} from "@/utils/formatters";
import {methodColorsBright} from "@/components/MethodBadge";
import { Skeleton } from "@/components/ui/skeleton";


export default function EndpointLatencyRanking({data = []}: EndpointLatencyRankingProps) {

    // Find the maximum latency for scaling the bars
    const maxLatency = Math.max(...data.map((item) => item.averageLatency))


    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle>Endpoint Latency Ranking</CardTitle>
                </div>
                <CardDescription>Average response time by endpoint</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.map((item) => (
                        <div key={item.endpointId} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                  <span
                      className={`inline-block w-2 h-2 rounded-full ${methodColorsBright[item.method] || "bg-gray-500"}`}
                  ></span>
                                    <span className="font-medium">{item.method}</span>
                                    <span
                                        className="text-muted-foreground truncate max-w-[200px] sm:max-w-[300px]">{item.endpoint}</span>
                                </div>
                                <span className="font-medium">{formatRequestDuration(item.averageLatency)}</span>
                            </div>
                            <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                    className={`absolute h-full rounded-full ${methodColorsBright[item.method] || "bg-gray-500"}`}
                                    style={{width: `${(item.averageLatency / maxLatency) * 100}%`}}
                                />
                            </div>
                        </div>
                    ))}

                    {data.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Bar className="h-10 w-10 text-muted-foreground mb-2"/>
                            <p className="text-muted-foreground">No endpoint data available</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

EndpointLatencyRanking.Skeleton = function WidgetSkeleton() {
    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-7 w-[220px]" />
                </div>
                <Skeleton className="h-4 w-[240px] mt-1" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-2 w-2 rounded-full" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-[180px]" />
                                </div>
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-2 w-full rounded-full" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
