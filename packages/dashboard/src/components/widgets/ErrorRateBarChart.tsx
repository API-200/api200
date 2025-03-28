"use client"

import {Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis} from "recharts"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart"
import {Skeleton} from "@/components/ui/skeleton"

export interface ErrorRateBarChartProps {
    data: {
        time: string
        requests: number
    }[]
}

export function ErrorRateBarChart({data}: ErrorRateBarChartProps) {
    return (
        <Card className="w-full">
            <CardHeader>

                <CardTitle>Error Rate Over Time</CardTitle>
                <CardDescription>Error rate percentage</CardDescription>

            </CardHeader>
            <CardContent>
                <div className="w-full">
                    <ChartContainer
                        config={{
                            errorRate: {
                                label: "Error Rate",
                                color: "hsl(var(--destructive))",
                            },
                        }}
                        className="h-52 w-full"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{top: 5, right: 5, left: 5, bottom: 20}}>

                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                <XAxis
                                    dataKey="time"
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    tickFormatter={(value) => `${value}%`}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent/>
                                    }
                                />
                                <Bar dataKey="requests" fill="var(--color-errorRate)" radius={[4, 4, 0, 0]}
                                     barSize={16} name="Error Rate"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    )
}

ErrorRateBarChart.Skeleton = function ErrorRateBarChartSkeleton() {
    return (
        <Card className="w-full">
            <CardHeader>
                <Skeleton className="h-5 w-48"/>
                <Skeleton className="mt-2 h-4 w-64"/>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-52 w-full"/>
            </CardContent>
        </Card>
    )
}

