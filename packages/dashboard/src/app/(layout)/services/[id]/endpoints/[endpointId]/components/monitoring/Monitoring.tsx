"use client"

import { useState, useEffect } from "react"
import { getMonitoringData } from "./getMonitoringData"
import type { Tables } from "@/utils/supabase/database.types"
import MonitoringViewer from "./MonitoringViewer"
import type { MonitoringData } from "./getMonitoringData"
import type { DateRange } from "@/components/shared/DateRangeSelector"

type Props = {
    endpoint: Tables<"endpoints">
}

export default function EndpointMonitoring({ endpoint }: Props) {
    const [data, setData] = useState<MonitoringData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [dateRange, setDateRange] = useState<DateRange>("24h")

    const refreshData = async () => {
        setIsLoading(true)
        try {
            const freshData = await getMonitoringData(endpoint, dateRange)
            setData(freshData)
        } catch (error) {
            console.error("Failed to refresh monitoring data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        refreshData()
    }, [dateRange])

    const handleDateRangeChange = (newRange: DateRange) => {
        setDateRange(newRange)
    }

    return (
        <MonitoringViewer
            data={data}
            isLoading={isLoading}
            onRefresh={refreshData}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
        />
    )
}

