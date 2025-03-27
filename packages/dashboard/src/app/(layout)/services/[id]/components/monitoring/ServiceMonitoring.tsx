"use client"

import {useEffect, useState} from 'react';
import {getServiceMonitoringData, ServiceMonitoringData} from "./getMonitoringData";
import type {Tables} from "@/utils/supabase/database.types";
import ServiceMonitoringViewer from "./ServiceMonitoringViewer";
import type {DateRange} from "@/components/shared/DateRangeSelector";

type Props = {
    endpoints: Tables<"endpoints">[]
}

export default function ServiceMonitoring({endpoints}: Props) {
    const [data, setData] = useState<ServiceMonitoringData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange>("24h")

    const refreshData = async () => {
        setIsLoading(true);
        try {
            const freshData = await getServiceMonitoringData(endpoints, dateRange);
            setData(freshData);
        } catch (error) {
            console.error("Failed to refresh service monitoring data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, [dateRange]);

    const handleDateRangeChange = (newRange: DateRange) => {
        setDateRange(newRange)
    }

    console.log(data)

    return (
        <ServiceMonitoringViewer
            data={data}
            isLoading={isLoading}
            onRefresh={refreshData}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
        />
    );
}
