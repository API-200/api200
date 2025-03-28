"use client"

import {Info} from "lucide-react"
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
    // Check if there's any data with non-zero values
    const hasData = data.some((item) => item.requests > 0)

    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Error Rate Over Time</CardTitle>
                        <CardDescription>Error rate percentage</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {hasData ? (
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

                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        tickFormatter={(value) => `${value}%`}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent indicator="dashed"
                                                                 formatter={(value) => [`${value}%`, "Error Rate"]}/>
                                        }
                                    />
                                    <Bar dataKey="requests" fill="var(--color-errorRate)" radius={[4, 4, 0, 0]}
                                         barSize={16} name="Error Rate"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Info className="h-10 w-10 text-muted-foreground/60"/>
                        <h3 className="mt-4 text-sm font-medium">No error data available</h3>
                        <p className="mt-2 text-xs text-muted-foreground max-w-[250px]">
                            Error rate data will appear here once requests with errors are processed.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// Skeleton loader for the widget
ErrorRateBarChart.Skeleton = function ErrorRateBarChartSkeleton() {
    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-5 w-48"/>
                        <Skeleton className="mt-2 h-4 w-64"/>
                    </div>
                    <Skeleton className="h-5 w-5 rounded-full"/>
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[300px] w-full"/>
            </CardContent>
        </Card>
    )
}

