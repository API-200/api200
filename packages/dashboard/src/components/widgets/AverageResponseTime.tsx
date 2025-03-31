import { Clock } from "lucide-react"
import { BarChart, Bar, ResponsiveContainer } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import {formatRequestDuration} from "@/utils/formatters";
import {AverageResponseTimeProps} from "@/components/widgets/getEndpointMonitoringData";



export function AverageResponseTime({ averageTime, recentTimes, lastUpdated }: AverageResponseTimeProps) {
    return (
        <Card>
            <CardHeader className="pb-1">
                <CardTitle >Average Response Time</CardTitle>
                <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className="text-2xl font-bold">{formatRequestDuration(averageTime)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Updated at {lastUpdated}</div>
                </div>
                <div className="mt-4 h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={recentTimes} barSize={8}>
                            <Bar dataKey="time" fill="hsl(var(--primary))" radius={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

