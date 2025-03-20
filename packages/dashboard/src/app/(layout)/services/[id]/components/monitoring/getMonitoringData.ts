"use client"

import { createClient } from "@/utils/supabase/client";
import { Tables } from "@/utils/supabase/database.types";

// Define interfaces for each widget
interface EndpointLatencyRanking {
    endpoint_id: number;
    endpoint_name: string;
    endpoint_method: string;
    avg_latency: number;
    sample_count: number;
}

interface ErrorRateByEndpoint {
    endpoint_id: number;
    endpoint_name: string;
    endpoint_method: string;
    total_requests: number;
    error_count: number;
    error_rate: number;
}

interface StatusCodeItem {
    name: string;
    value: number;
    color: string;
}

interface TimeSeriesDataPoint {
    time: string;
    requests: number;
}

interface ErrorRateTrendPoint {
    time: string;
    error_rate: number;
    total_requests: number;
}

interface FallbackMockUsage {
    fallback_percentage: number;
    mock_percentage: number;
    total_requests: number;
}

interface AnomalyCluster {
    endpoint_id: number;
    endpoint_name: string;
    endpoint_method: string;
    res_code: number | null;
    count: number;
    is_anomaly: boolean;
}

interface ResponseTimeAnomaly {
    endpoint_id: number;
    endpoint_name: string;
    endpoint_method: string;
    timestamp: string;
    took_ms: number;
    is_anomaly: boolean;
    z_score: number;
}

// Main service monitoring interface
export interface ServiceMonitoringData {
    statusCodeDistribution: {
        data: StatusCodeItem[];
    };
    endpointLatencyRanking: {
        data: EndpointLatencyRanking[];
    };
    errorRateByEndpoint: {
        data: ErrorRateByEndpoint[];
    };
    requestsOverTime: {
        data: TimeSeriesDataPoint[];
        title: string;
        description: string;
    };
    errorRateTrend: {
        data: ErrorRateTrendPoint[];
    };
    fallbackMockUsage: FallbackMockUsage;
    errorClustering: {
        data: AnomalyCluster[];
    };
    responseTimeAnomalies: {
        data: ResponseTimeAnomaly[];
    };
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

// Helper to detect anomalies using Z-score
const detectAnomalies = (data: number[], threshold = 2.5): boolean[] => {
    if (data.length === 0) return [];

    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return data.map(() => false);

    return data.map(val => Math.abs((val - mean) / stdDev) > threshold);
};

// Helper to calculate Z-scores
const calculateZScores = (data: number[]): number[] => {
    if (data.length === 0) return [];

    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return data.map(() => 0);

    return data.map(val => (val - mean) / stdDev);
};

export const getServiceMonitoringData = async (endpoints: Tables<'endpoints'>[]): Promise<ServiceMonitoringData> => {
    const supabase = await createClient();
    const endpointIds = endpoints.map(endpoint => endpoint.id);

    // Create maps for endpoint info lookup
    const endpointNameMap = new Map<number, string>();
    const endpointMethodMap = new Map<number, string>();

    endpoints.forEach(endpoint => {
        endpointNameMap.set(endpoint.id, endpoint.name || `Endpoint ${endpoint.id}`);
        endpointMethodMap.set(endpoint.id, endpoint.method || "");
    });

    // Function to get formatted endpoint info
    const getEndpointInfo = (endpointId: number) => {
        const name = endpointNameMap.get(endpointId) || `Endpoint ${endpointId}`;
        const method = endpointMethodMap.get(endpointId) || "";
        return { name, method };
    };

    // Calculate timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const twentyFourHoursAgoStr = twentyFourHoursAgo.toISOString();

    // Get logs for all endpoints for the last 24 hours
    const { data: logs, error } = await supabase
        .from("logs")
        .select("*")
        .in("endpoint_id", endpointIds)
        .gte("started_at", twentyFourHoursAgoStr)
        .order("started_at", { ascending: false });

    if (error || !logs) {
        console.error("Error fetching logs:", error);
        throw new Error(`Failed to fetch logs: ${error?.message || "Unknown error"}`);
    }

    // --- Status Code Distribution ---
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

    // --- Endpoint Latency Ranking ---
    const latencyByEndpoint: Record<number, { sum: number; count: number }> = {};

    logs.forEach(log => {
        if (log.took_ms && log.took_ms > 0) {
            if (!latencyByEndpoint[log.endpoint_id]) {
                latencyByEndpoint[log.endpoint_id] = { sum: 0, count: 0 };
            }
            latencyByEndpoint[log.endpoint_id].sum += log.took_ms;
            latencyByEndpoint[log.endpoint_id].count += 1;
        }
    });

    const endpointLatencyRanking: EndpointLatencyRanking[] = Object.entries(latencyByEndpoint)
        .map(([endpointId, data]) => {
            const id = parseInt(endpointId);
            const endpointInfo = getEndpointInfo(id);
            return {
                endpoint_id: id,
                endpoint_name: endpointInfo.name,
                endpoint_method: endpointInfo.method,
                avg_latency: Math.round((data.sum / data.count) * 100) / 100,
                sample_count: data.count
            };
        })
        .sort((a, b) => b.avg_latency - a.avg_latency); // Sort by highest latency first

    // --- Error Rate by Endpoint ---
    const errorsByEndpoint: Record<number, { errors: number; total: number }> = {};

    endpointIds.forEach(id => {
        errorsByEndpoint[id] = { errors: 0, total: 0 };
    });

    logs.forEach(log => {
        const endpointId = log.endpoint_id;
        if (!errorsByEndpoint[endpointId]) {
            errorsByEndpoint[endpointId] = { errors: 0, total: 0 };
        }

        errorsByEndpoint[endpointId].total += 1;

        // Count as error if error field is not null or status code is 4xx or 5xx
        if (log.error || (log.res_code && log.res_code >= 400)) {
            errorsByEndpoint[endpointId].errors += 1;
        }
    });

    const errorRateByEndpoint: ErrorRateByEndpoint[] = Object.entries(errorsByEndpoint)
        .map(([endpointId, data]) => {
            const id = parseInt(endpointId);
            const endpointInfo = getEndpointInfo(id);
            return {
                endpoint_id: id,
                endpoint_name: endpointInfo.name,
                endpoint_method: endpointInfo.method,
                total_requests: data.total,
                error_count: data.errors,
                error_rate: data.total > 0 ? Math.round((data.errors / data.total) * 10000) / 100 : 0 // As percentage, rounded to 2 decimal places
            };
        })
        .sort((a, b) => b.error_rate - a.error_rate); // Sort by highest error rate first

    // --- Requests Over Time ---
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

    // --- Error Rate Trend ---
    const errorTrendSlots = generateTimeSlots().map(slot => ({
        time: slot.time,
        error_rate: 0,
        total_requests: 0
    }));

    logs.forEach(log => {
        const logTime = new Date(log.started_at);
        const hourStr = logTime.toISOString().slice(11, 13) + ":00";

        const slotIndex = errorTrendSlots.findIndex(slot => slot.time === hourStr);
        if (slotIndex !== -1) {
            errorTrendSlots[slotIndex].total_requests += 1;

            // Count as error if error field is not null or status code is 4xx or 5xx
            if (log.error || (log.res_code && log.res_code >= 400)) {
                errorTrendSlots[slotIndex].error_rate += 1;
            }
        }
    });

    // Calculate the error rate percentage
    errorTrendSlots.forEach(slot => {
        if (slot.total_requests > 0) {
            slot.error_rate = (slot.error_rate / slot.total_requests) * 100;
        } else {
            slot.error_rate = 0;
        }
    });

    // --- Fallback/Mock Usage ---
    const totalRequests = logs.length;
    const fallbackResponses = logs.filter(log => log.is_fallback_response).length;
    const mockResponses = logs.filter(log => log.is_mock_response).length;

    const fallbackMockUsage: FallbackMockUsage = {
        fallback_percentage: totalRequests > 0 ? (fallbackResponses / totalRequests) * 100 : 0,
        mock_percentage: totalRequests > 0 ? (mockResponses / totalRequests) * 100 : 0,
        total_requests: totalRequests
    };

    // --- Error Clustering ---
    // Group errors by endpoint and status code
    const errorClusters: Record<string, { count: number; endpoint_id: number; res_code: number | null }> = {};

    logs.forEach(log => {
        if (log.error || (log.res_code && log.res_code >= 400)) {
            const key = `${log.endpoint_id}-${log.res_code || 'null'}`;

            if (!errorClusters[key]) {
                errorClusters[key] = {
                    count: 0,
                    endpoint_id: log.endpoint_id,
                    res_code: log.res_code
                };
            }

            errorClusters[key].count += 1;
        }
    });

    // Convert to array and identify anomalies
    const errorClusterArray = Object.values(errorClusters);
    const errorCounts = errorClusterArray.map(cluster => cluster.count);
    const anomalies = detectAnomalies(errorCounts);

    const errorClustering: AnomalyCluster[] = errorClusterArray.map((cluster, index) => {
        const endpointInfo = getEndpointInfo(cluster.endpoint_id);
        return {
            endpoint_id: cluster.endpoint_id,
            endpoint_name: endpointInfo.name,
            endpoint_method: endpointInfo.method,
            res_code: cluster.res_code,
            count: cluster.count,
            is_anomaly: anomalies[index]
        };
    });

    // --- Response Time Anomalies ---
    // Group response times by endpoint
    const responseTimesByEndpoint: Record<number, { times: number[]; timestamps: string[] }> = {};

    logs.forEach(log => {
        if (log.took_ms && log.took_ms > 0) {
            if (!responseTimesByEndpoint[log.endpoint_id]) {
                responseTimesByEndpoint[log.endpoint_id] = { times: [], timestamps: [] };
            }

            responseTimesByEndpoint[log.endpoint_id].times.push(log.took_ms);
            responseTimesByEndpoint[log.endpoint_id].timestamps.push(log.started_at);
        }
    });

    // Detect anomalies for each endpoint
    const responseTimeAnomalies: ResponseTimeAnomaly[] = [];

    Object.entries(responseTimesByEndpoint).forEach(([endpointId, data]) => {
        const zScores = calculateZScores(data.times);
        const anomalies = zScores.map(score => Math.abs(score) > 2.5);
        const id = parseInt(endpointId);
        const endpointInfo = getEndpointInfo(id);

        anomalies.forEach((isAnomaly, index) => {
            if (isAnomaly) {
                responseTimeAnomalies.push({
                    endpoint_id: id,
                    endpoint_name: endpointInfo.name,
                    endpoint_method: endpointInfo.method,
                    timestamp: data.timestamps[index],
                    took_ms: data.times[index],
                    is_anomaly: true,
                    z_score: zScores[index]
                });
            }
        });
    });

    // Sort anomalies by timestamp (most recent first)
    responseTimeAnomalies.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
        statusCodeDistribution: {
            data: statusCodeItems
        },
        endpointLatencyRanking: {
            data: endpointLatencyRanking
        },
        errorRateByEndpoint: {
            data: errorRateByEndpoint
        },
        requestsOverTime: {
            data: timeSlots,
            title: "Service Requests per Hour",
            description: "Number of requests across all endpoints in the last 24 hours"
        },
        errorRateTrend: {
            data: errorTrendSlots
        },
        fallbackMockUsage,
        errorClustering: {
            data: errorClustering
        },
        responseTimeAnomalies: {
            data: responseTimeAnomalies
        }
    };
};
