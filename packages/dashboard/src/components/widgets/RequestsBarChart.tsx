import {Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis} from "recharts"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart"
import { RequestsBarChartProps } from "./getEndpointMonitoringData"

export function RequestsBarChart({
                                     data,
                                     title = "Requests over time",
                                     description = "Last 24 hours",
                                 }: RequestsBarChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full">
                    <ChartContainer
                        config={{
                            requests: {
                                label: "Requests",
                                color: "hsl(var(--primary))",
                            },
                        }}
                        className="h-52 w-full"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                <XAxis
                                    dataKey="time"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => value}
                                />
                                <YAxis tickLine={false} axisLine={false}/>
                                <ChartTooltip content={<ChartTooltipContent/>}/>
                                <Bar
                                    dataKey="requests"
                                    fill="var(--color-requests)"
                                    radius={[4, 4, 0, 0]}
                                    barSize={16}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    )
}
