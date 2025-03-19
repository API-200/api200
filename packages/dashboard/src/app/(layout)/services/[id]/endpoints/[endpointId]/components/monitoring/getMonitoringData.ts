import {createClient} from "@/utils/supabase/server";
import {Tables} from "@/utils/supabase/database.types";

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
    if (statusCode >= 200 && statusCode < 300) return "#10B981"; // Green for 2xx
    if (statusCode >= 300 && statusCode < 400) return "#F59E0B"; // Yellow for 3xx
    if (statusCode >= 400 && statusCode < 500) return "#EF4444"; // Red for 4xx
    if (statusCode >= 500) return "#7F1D1D"; // Dark red for 5xx
    return "#6B7280"; // Gray for other
};

// Helper function to generate hourly time buckets for the last 24 hours
const generateTimeSlots = (): TimeSeriesDataPoint[] => {
    const slots: TimeSeriesDataPoint[] = [];
    const now = new Date();

    for (let i = 23; i >= 0; i--) {
        const date = new Date(now);
        date.setHours(now.getHours() - i);
        date.setMinutes(0, 0, 0);

        slots.push({
            time: date.toISOString().slice(11, 13) + ":00", // Format as "HH:00"
            requests: 0
        });
    }

    return slots;
};

export const getMonitoringData = async (endpoint: Tables<'endpoints'>): Promise<MonitoringData> => {
    const supabase = await createClient();
    const endpointId = endpoint.id;

    // Calculate timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const twentyFourHoursAgoStr = twentyFourHoursAgo.toISOString();

    // Get logs for the last 24 hours
    const { data: logs, error } = await supabase
        .from("logs")
        .select("*")
        .eq("endpoint_id", endpointId)
        .gte("started_at", twentyFourHoursAgoStr)
        .order("started_at", { ascending: false });

    if (error || !logs) {
        console.error("Error fetching logs:", error);
        throw new Error(`Failed to fetch logs: ${error?.message || "Unknown error"}`);
    }

    // --- Calculate Average Response Time ---
    const validTimes = logs.filter(log => log.took_ms && log.took_ms > 0);
    const averageTime = validTimes.length > 0
        ? validTimes.reduce((sum, log) => sum + log.took_ms, 0) / validTimes.length
        : 0;

    // Get the 10 most recent response times for the chart
    const recentTimes: ResponseTimeData[] = logs.slice(0, 10).map(log => ({
        id: log.id.toString(),
        time: log.took_ms || 0,
        endpoint: endpoint.name || "",
        timestamp: new Date(log.started_at).toISOString()
    })).reverse();

    // --- Calculate Cache Hit Ratio ---
    const totalRequests = logs.length;
    const cacheHits = logs.filter(log => log.cache_hit === true).length;

    // --- Generate Requests Bar Chart data ---
    const timeSlots = generateTimeSlots();

    // Fill the time slots with actual request counts
    logs.forEach(log => {
        const logTime = new Date(log.started_at);
        const hourStr = logTime.toISOString().slice(11, 13) + ":00"; // Format as "HH:00"

        const slotIndex = timeSlots.findIndex(slot => slot.time === hourStr);
        if (slotIndex !== -1) {
            timeSlots[slotIndex].requests += 1;
        }
    });

    // --- Calculate Status Code Distribution ---
    const statusCodeCounts: Record<string, number> = {};

    logs.forEach(log => {
        const statusCode = log.res_code;
        if (statusCode) {
            // Group by hundred (e.g., 200, 300, 400, 500)
            const statusGroup = Math.floor(statusCode / 100) * 100;
            const statusKey = `${statusGroup}`;

            statusCodeCounts[statusKey] = (statusCodeCounts[statusKey] || 0) + 1;
        }
    });

    const statusCodeItems: StatusCodeItem[] = Object.entries(statusCodeCounts).map(([code, count]) => ({
        name: `${code}`,
        value: count,
        color: getStatusCodeColor(parseInt(code))
    }));

    return {
        AverageResponseTimeProps: {
            averageTime: Math.round(averageTime * 100) / 100, // Round to 2 decimal places
            recentTimes,
            lastUpdated: new Date().toISOString()
        },
        CacheHitRatioProps: {
            cacheHits,
            totalRequests
        },
        RequestsBarChartProps: {
            data: timeSlots,
            title: "Requests per Hour",
            description: "Number of requests in the last 24 hours"
        },
        StatusCodeDistributionProps: {
            data: statusCodeItems
        }
    };
};
