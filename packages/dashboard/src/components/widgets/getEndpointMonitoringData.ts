"use client"

import { createClient } from "@/utils/supabase/client"
import type { Tables } from "@/utils/supabase/database.types"
import { format } from "date-fns"
import type { DateRange } from "@/components/shared/DateRangeSelector"

interface ResponseTimeData {
    id: string
    time: number
    endpoint: string
    timestamp: string
}

export interface AverageResponseTimeProps {
    averageTime: number
    recentTimes: ResponseTimeData[]
    lastUpdated: string
}

export interface CacheHitRatioProps {
    cacheHits: number
    totalRequests: number
}

interface TimeSeriesDataPoint {
    time: string
    requests: number
}

export interface RequestsBarChartProps {
    data: TimeSeriesDataPoint[]
    title?: string
    description?: string
}

interface StatusCodeItem {
    name: string
    value: number
    color: string
}

export interface StatusCodeDistributionProps {
    data: StatusCodeItem[]
}

export interface MonitoringData {
    AverageResponseTimeProps: AverageResponseTimeProps
    CacheHitRatioProps: CacheHitRatioProps
    RequestsBarChartProps: RequestsBarChartProps
    StatusCodeDistributionProps: StatusCodeDistributionProps
}

// Helper function to get color for status code
const getStatusCodeColor = (statusCode: number): string => {
    if (statusCode >= 200 && statusCode < 300) return "#10B981" // Green for 2xx
    if (statusCode >= 300 && statusCode < 400) return "#F59E0B" // Yellow for 3xx
    if (statusCode >= 400 && statusCode < 500) return "#EF4444" // Red for 4xx
    if (statusCode >= 500) return "#7F1D1D" // Dark red for 5xx
    return "#6B7280" // Gray for other
}

// Helper function to generate time buckets based on the selected range
const generateTimeSlots = (dateRange: DateRange): TimeSeriesDataPoint[] => {
    const slots: TimeSeriesDataPoint[] = []
    const now = new Date()

    let totalSlots = 24 // Default for 24h
    let hourIncrement = 1
    let format = "HH:00" // Format as "HH:00" for hourly

    if (dateRange === "7d") {
        totalSlots = 7
        hourIncrement = 24 // Daily increments
        format = "MMM dd" // Format as "Jan 01"
    } else if (dateRange === "30d") {
        totalSlots = 30
        hourIncrement = 24 // Daily increments
        format = "MMM dd" // Format as "Jan 01"
    }

    for (let i = totalSlots - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setHours(now.getHours() - i * hourIncrement)

        if (dateRange === "24h") {
            date.setMinutes(0, 0, 0)
            slots.push({
                time: date.toISOString().slice(11, 13) + ":00", // Format as "HH:00"
                requests: 0,
            })
        } else {
            // For 7d and 30d, set to start of day
            date.setHours(0, 0, 0, 0)
            const formattedDate = new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
            }).format(date)

            slots.push({
                time: formattedDate,
                requests: 0,
            })
        }
    }

    return slots
}

// Helper function to get the timestamp for the start of the selected range
const getStartTimestamp = (dateRange: DateRange): Date => {
    const now = new Date()

    if (dateRange === "24h") {
        const timestamp = new Date(now)
        timestamp.setHours(now.getHours() - 24)
        return timestamp
    } else if (dateRange === "7d") {
        const timestamp = new Date(now)
        timestamp.setDate(now.getDate() - 7)
        return timestamp
    } else if (dateRange === "30d") {
        const timestamp = new Date(now)
        timestamp.setDate(now.getDate() - 30)
        return timestamp
    }

    return new Date(now.setHours(now.getHours() - 24)) // Default to 24h
}

// Helper function to get the appropriate time bucket for a log entry
const getTimeBucket = (logTime: Date, dateRange: DateRange): string => {
    if (dateRange === "24h") {
        return logTime.toISOString().slice(11, 13) + ":00" // Format as "HH:00"
    } else {
        // For 7d and 30d, use the day
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
        }).format(logTime)
    }
}

export const getEndpointMonitoringData = async (
    endpoint: Tables<"endpoints">,
    dateRange: DateRange = "24h",
): Promise<MonitoringData> => {
    const supabase = await createClient()
    const endpointId = endpoint.id

    // Calculate timestamp for the start of the selected range
    const startTimestamp = getStartTimestamp(dateRange)
    const startTimestampStr = startTimestamp.toISOString()

    // Get logs for the selected time range
    const { data: logs, error } = await supabase
        .from("logs")
        .select("*")
        .eq("endpoint_id", endpointId)
        .gte("started_at", startTimestampStr)
        .order("started_at", { ascending: false })


    if (error || !logs) {
        console.error("Error fetching logs:", error)
        throw new Error(`Failed to fetch logs: ${error?.message || "Unknown error"}`)
    }

    // --- Calculate Average Response Time ---
    const validTimes = logs.filter((log) => log.took_ms && log.took_ms > 0)
    const averageTime =
        validTimes.length > 0 ? validTimes.reduce((sum, log) => sum + log.took_ms, 0) / validTimes.length : 0

    // Get the 10 most recent response times for the chart
    const recentTimes: ResponseTimeData[] = logs
        .slice(0, 10)
        .map((log) => ({
            id: log.id.toString(),
            time: log.took_ms || 0,
            endpoint: endpoint.name || "",
            timestamp: new Date(log.started_at).toISOString(),
        }))
        .reverse()

    // --- Calculate Cache Hit Ratio ---
    const totalRequests = logs.length
    const cacheHits = logs.filter((log) => log.cache_hit === true).length

    // --- Generate Requests Chart data ---
    const timeSlots = generateTimeSlots(dateRange)

    // Fill the time slots with actual request counts
    logs.forEach((log) => {
        const logTime = new Date(log.started_at)
        const timeBucket = getTimeBucket(logTime, dateRange)

        const slotIndex = timeSlots.findIndex((slot) => slot.time === timeBucket)
        if (slotIndex !== -1) {
            timeSlots[slotIndex].requests += 1
        }
    })

    // --- Calculate Status Code Distribution ---
    const statusCodeCounts: Record<string, number> = {}

    logs.forEach((log) => {
        const statusCode = log.res_code
        if (statusCode) {
            // Group by hundred (e.g., 200, 300, 400, 500)
            const statusGroup = Math.floor(statusCode / 100) * 100
            const statusKey = `${statusGroup}`

            statusCodeCounts[statusKey] = (statusCodeCounts[statusKey] || 0) + 1
        }
    })

    const statusCodeItems: StatusCodeItem[] = Object.entries(statusCodeCounts).map(([code, count]) => ({
        name: `${code}`,
        value: count,
        color: getStatusCodeColor(Number.parseInt(code)),
    }))

    // Update chart title and description based on date range
    let title = "Requests per Hour"
    let description = "Number of requests in the last 24 hours"

    if (dateRange === "7d") {
        title = "Requests per Day"
        description = "Number of requests in the last 7 days"
    } else if (dateRange === "30d") {
        title = "Requests per Day"
        description = "Number of requests in the last 30 days"
    }

    return {
        AverageResponseTimeProps: {
            averageTime: Math.round(averageTime * 100) / 100, // Round to 2 decimal places
            recentTimes,
            lastUpdated: format(new Date(), "HH:mm"),
        },
        CacheHitRatioProps: {
            cacheHits,
            totalRequests,
        },
        RequestsBarChartProps: {
            data: timeSlots,
            title,
            description,
        },
        StatusCodeDistributionProps: {
            data: statusCodeItems,
        },
    }
}

