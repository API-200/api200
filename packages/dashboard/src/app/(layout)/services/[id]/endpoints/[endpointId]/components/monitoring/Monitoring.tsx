"use client"

import { useState, useEffect } from 'react';
import { getMonitoringData } from "./getMonitoringData";
import type { Tables } from "@/utils/supabase/database.types";
import MonitoringViewer from "./MonitoringViewer";
import { MonitoringData } from "./getMonitoringData";

type Props = {
    endpoint: Tables<"endpoints">
}

export default function EndpointMonitoring({ endpoint  }: Props) {
    const [data, setData] = useState<MonitoringData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshData = async () => {
        setIsLoading(true);
        try {
            const freshData = await getMonitoringData(endpoint);
            setData(freshData);
        } catch (error) {
            console.error("Failed to refresh monitoring data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);


    return (
        <MonitoringViewer
            data={data}
            isLoading={isLoading}
            onRefresh={refreshData}
        />
    );
}
