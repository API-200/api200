"use client"

import { createClient } from "@/utils/supabase/client"
import type { Tables } from "@/utils/supabase/database.types"
import { format } from "date-fns"
import type { DateRange } from "@/components/shared/DateRangeSelector"

// Interfaces for Service Monitoring Data
export interface ServiceMonitoringData {
    StatusCodeDistributionProps: StatusCodeDistributionProps
    EndpointLatencyRankingProps: EndpointLatencyRankingProps
    ErrorRateByEndpointProps: ErrorRateByEndpointProps
    RequestsOverTimeProps: RequestsOverTimeProps
    ErrorRateTrendProps: ErrorRateTrendProps
    FallbackMockUsageProps: FallbackMockUsageProps
    ErrorClusteringProps: ErrorClusteringProps
    ResponseTimeSpikesProps: ResponseTimeSpikesProps
}

// Existing interfaces from endpoint monitoring
interface StatusCodeItem {
    name: string
    value: number
    color: string
}

export interface StatusCodeDistributionProps {
    data: StatusCodeItem[]
}

export interface EndpointLatencyRankingProps {
    data: {
        endpoint: string
        averageLatency: number
        endpointId: number
    }[]
}

export interface ErrorRateByEndpointProps {
    data: {
        endpoint: string
        errorRate: number
        endpointId: number
        totalRequests: number
        errorCount: number
    }[]
}

interface TimeSeriesDataPoint {
    time: string
    requests: number
}

export interface RequestsOverTimeProps {
    data: TimeSeriesDataPoint[]
    title?: string
    description?: string
}

export interface ErrorRateTrendProps {
    data: TimeSeriesDataPoint[]
}

export interface FallbackMockUsageProps {
    fallbackRate: number
    mockRate: number
}

export interface ErrorClusteringProps {
    data: {
        endpointId: number
        resCode: number | null
        errorCount: number
    }[]
}

export interface ResponseTimeSpikesProps {
    data: {
        time: string
        tookMs: number
        endpointId: number
        isAnomaly: boolean
    }[]
}

// Helper function to determine status code color (existing function)
const getStatusCodeColor = (statusCode: number): string => {
    if (statusCode >= 200 && statusCode < 300) return "#10B981" // Green for 2xx
    if (statusCode >= 300 && statusCode < 400) return "#F59E0B" // Yellow for 3xx
    if (statusCode >= 400 && statusCode < 500) return "#EF4444" // Red for 4xx
    if (statusCode >= 500) return "#7F1D1D" // Dark red for 5xx
    return "#6B7280" // Gray for other
}

// Helper function to generate time buckets
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

// Helper function to get the time bucket for a log entry
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

// Helper function for anomaly detection (simple z-score method)
const detectAnomaly = (values: number[], threshold: number = 1.5): boolean[] => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)

    return values.map(value => Math.abs(value - mean) > (threshold * stdDev))
}

export const getServiceMonitoringData = async (
    endpoints: Tables<"endpoints">[],
    dateRange: DateRange = "24h",
): Promise<ServiceMonitoringData> => {
    const supabase = await createClient()

    // Calculate timestamp for the start of the selected range
    const startTimestamp = getStartTimestamp(dateRange)
    const startTimestampStr = startTimestamp.toISOString()

    // Fetch logs for all specified endpoints
    const endpointIds = endpoints.map(endpoint => endpoint.id)
    console.log('endpointIds',endpointIds)
    const { data: logs, error } = await supabase
        .from("logs")
        .select("*")
        .in("endpoint_id", endpointIds)
        .gte("started_at", startTimestampStr)
        .order("started_at", { ascending: false })

    if (error || !logs) {
        console.error("Error fetching logs:", error)
        throw new Error(`Failed to fetch logs: ${error?.message || "Unknown error"}`)
    }

    console.log('logs',logs)

    // 1. Status Code Distribution
    const statusCodeCounts: Record<string, number> = {}
    logs.forEach((log) => {
        const statusCode = log.res_code
        if (statusCode) {
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

    // 2. Endpoint Latency Ranking
    const latencyByEndpoint: Record<number, number[]> = {}
    logs.forEach((log) => {
        if (log.took_ms) {
            latencyByEndpoint[log.endpoint_id] = [
                ...(latencyByEndpoint[log.endpoint_id] || []),
                log.took_ms
            ]
        }
    })

    const endpointLatencyRanking = Object.entries(latencyByEndpoint).map(([endpointId, latencies]) => {
        const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length
        const endpointName = endpoints.find(e => e.id === Number(endpointId))?.name || `Endpoint ${endpointId}`

        return {
            endpoint: endpointName,
            averageLatency: Math.round(averageLatency * 100) / 100,
            endpointId: Number(endpointId)
        }
    }).sort((a, b) => b.averageLatency - a.averageLatency)

    // 3. Error Rate by Endpoint
    const errorRateByEndpoint = endpoints.map(endpoint => {
        const endpointLogs = logs.filter(log => log.endpoint_id === endpoint.id)
        const totalRequests = endpointLogs.length
        const errorCount = endpointLogs.filter(log => log.error !== null).length

        return {
            endpoint: endpoint.name,
            endpointId: endpoint.id,
            totalRequests,
            errorCount,
            errorRate: totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0
        }
    })

    // 4. Requests Over Time
    const timeSlots = generateTimeSlots(dateRange)
    logs.forEach((log) => {
        const logTime = new Date(log.started_at)
        const timeBucket = getTimeBucket(logTime, dateRange)

        const slotIndex = timeSlots.findIndex((slot) => slot.time === timeBucket)
        if (slotIndex !== -1) {
            timeSlots[slotIndex].requests += 1
        }
    })

    // 5. Error Rate Trend
    const errorRateTimeSlots = [...timeSlots]
    logs.forEach((log) => {
        const logTime = new Date(log.started_at)
        const timeBucket = getTimeBucket(logTime, dateRange)

        const slotIndex = errorRateTimeSlots.findIndex((slot) => slot.time === timeBucket)
        if (slotIndex !== -1 && log.error !== null) {
            errorRateTimeSlots[slotIndex].requests += 1
        }
    })

    const errorRateTrend = errorRateTimeSlots.map(slot => ({
        ...slot,
        requests: slot.requests > 0
            ? (slot.requests / timeSlots.find(t => t.time === slot.time)!.requests) * 100
            : 0
    }))

    // 6. Fallback/Mock Usage
    const totalLogs = logs.length
    const fallbackCount = logs.filter(log => log.is_fallback_response).length
    const mockCount = logs.filter(log => log.is_mock_response).length

    // 7. Error Clustering
    const errorClustering = logs
        .filter(log => log.error !== null)
        .map(log => ({
            endpointId: log.endpoint_id,
            resCode: log.res_code,
            errorCount: 1
        }))
        .reduce((acc, error) => {
            const existingError = acc.find(
                e => e.endpointId === error.endpointId &&
                    e.resCode === error.resCode
            )

            if (existingError) {
                existingError.errorCount += 1
            } else {
                acc.push(error)
            }

            return acc
        }, [] as { endpointId: number; resCode: number | null; errorCount: number }[])

    // 8. Response Time Spikes
    const responseTimeSpikeData = logs.map(log => {
        const logTime = new Date(log.started_at)
        return {
            time: logTime.toISOString(),
            tookMs: log.took_ms || 0,
            endpointId: log.endpoint_id
        }
    })

    const responseTimeSpikes = endpoints.flatMap(endpoint => {
        const endpointTimes = logs
            .filter(log => log.endpoint_id === endpoint.id && log.took_ms)
            .map(log => log.took_ms!)

        const anomalies = detectAnomaly(endpointTimes)

        return responseTimeSpikeData
            .filter(spike => spike.endpointId === endpoint.id)
            .map((spike, index) => ({
                ...spike,
                isAnomaly: anomalies[index] || false
            }))
    })

    return {
        StatusCodeDistributionProps: {
            data: statusCodeItems
        },
        EndpointLatencyRankingProps: {
            data: endpointLatencyRanking
        },
        ErrorRateByEndpointProps: {
            data: errorRateByEndpoint
        },
        RequestsOverTimeProps: {
            data: timeSlots,
            title: dateRange === "24h" ? "Requests per Hour" : "Requests per Day",
            description: `Number of requests in the last ${dateRange}`
        },
        ErrorRateTrendProps: {
            data: errorRateTrend
        },
        FallbackMockUsageProps: {
            fallbackRate: (fallbackCount / totalLogs) * 100,
            mockRate: (mockCount / totalLogs) * 100
        },
        ErrorClusteringProps: {
            data: errorClustering
        },
        ResponseTimeSpikesProps: {
            data: responseTimeSpikes
        }
    }
}
