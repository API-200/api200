import { Database } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CacheHitRatioProps } from "./getEndpointMonitoringData"


export function CacheHitRatio({ cacheHits, totalRequests }: CacheHitRatioProps) {
    const cacheHitRatio = (cacheHits / totalRequests) * 100

    return (
        <Card>
            <CardHeader className="pb-1">
                <CardTitle >Cache Hit Ratio</CardTitle>
                <CardDescription>Cache hits vs total requests</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
                <div className="flex flex-col items-center justify-center h-48">
                    <div className="relative flex items-center justify-center">
                        <Database className="h-12 w-12 text-muted-foreground/30" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold">{cacheHitRatio.toFixed(0)}%</span>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <div className="text-sm text-muted-foreground">
                            {cacheHits} cache hits out of {totalRequests} requests
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

