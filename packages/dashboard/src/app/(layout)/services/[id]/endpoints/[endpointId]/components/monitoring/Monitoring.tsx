import {getMonitoringData} from "./getMonitoringData";
import type {Tables} from "@/utils/supabase/database.types";
import MonitoringViewer
    from "./MonitoringViewer";

type Props = {
    endpoint: Tables<"endpoints">
}

export default async function EndpointMonitoring({endpoint}: Props) {

    const data = await getMonitoringData(endpoint)

    return (
        <MonitoringViewer data={data}/>
    )
}

