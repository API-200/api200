import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    StatusCodeDistributionProps
} from "./getEndpointMonitoringData";


export function StatusCodeDistribution({ data }: StatusCodeDistributionProps) {

    return (
        <Card>
            <CardHeader className="pb-1">
                <CardTitle>Status Code Distribution</CardTitle>
                <CardDescription>2xx/3xx/4xx/5xx breakdown</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                                {data?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <div
                                                            className="h-2 w-2 rounded-full"
                                                            style={{ backgroundColor: payload[0].payload.color }}
                                                        />
                                                        <span className="text-sm font-medium">{payload[0].name}</span>
                                                    </div>
                                                    <div className="text-sm font-medium">{payload[0].value}%</div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
                    {data.map((item) => (
                        <div key={item.name} className="flex flex-col items-center">
                            <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span>{item.name}</span>
                            </div>
                            <span className="font-medium">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

