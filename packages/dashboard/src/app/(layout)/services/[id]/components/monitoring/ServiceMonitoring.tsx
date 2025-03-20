"use client"

import { useState, useEffect } from 'react';
import { getServiceMonitoringData, ServiceMonitoringData } from "./getMonitoringData";
import type { Tables } from "@/utils/supabase/database.types";
import ServiceMonitoringViewer from "./ServiceMonitoringViewer";

type Props = {
    endpoints: Tables<"endpoints">[]
}

export default function ServiceMonitoring({ endpoints  }: Props) {
    const [data, setData] = useState<ServiceMonitoringData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshData = async () => {
        setIsLoading(true);
        try {
            const freshData = await getServiceMonitoringData(endpoints);
            setData(freshData);
        } catch (error) {
            console.error("Failed to refresh service monitoring data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);


    return (
        <ServiceMonitoringViewer
            data={data}
            isLoading={isLoading}
            onRefresh={refreshData}
        />
    );
}
