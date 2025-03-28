"use client"

import { useEffect, useState, useCallback } from "react"
import { DataTable } from "@/components/tables/DataTable"
import { columns } from "./columns"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { TableSkeleton } from "@/components/tables/TableSkeleton"
import { Loader2, RefreshCw, Download } from "lucide-react"
import { LogCard } from "./LogCard"
import type { Tables } from "@/utils/supabase/database.types"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Props = {
    endpoint: Tables<"endpoints">
}

const PAGE_SIZE = 10

type EnhancedLog = Tables<"logs"> & { endpoint: Tables<"endpoints"> }

export function Logs({ endpoint }: Props) {
    const [logs, setLogs] = useState<EnhancedLog[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [selectedLog, setSelectedLog] = useState<EnhancedLog | null>(null)
    const [hasMore, setHasMore] = useState(true)

    const supabase = createClient()

    const fetchLogs = useCallback(
        async (isLoadMore = false) => {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            try {
                const { data, error } = await supabase
                    .from("logs")
                    .select("*")
                    .eq("endpoint_id", endpoint.id)
                    .order("started_at", { ascending: false })
                    .range(isLoadMore ? logs.length : 0, isLoadMore ? logs.length + PAGE_SIZE : PAGE_SIZE)
                    .limit(PAGE_SIZE + 1);

                if (error) {
                    console.error("Error fetching logs:", error);
                    setHasMore(false);
                } else {
                    setHasMore(data.length > PAGE_SIZE);
                    const newLogs = data.slice(0, PAGE_SIZE);

                    setLogs(prevLogs => {
                        if (isLoadMore) {
                            return [...prevLogs, ...newLogs.map(log => ({ ...log, endpoint }))];
                        } else {
                            return newLogs.map(log => ({ ...log, endpoint }));
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching logs:", error);
                setHasMore(false);
            }

            if (isLoadMore) {
                setLoadingMore(false);
            } else {
                setLoading(false);
            }
        },
        [endpoint.id, supabase, endpoint],
    );

    const refreshLogs = () => {
        fetchLogs()
    }

    const downloadLogs = async () => {
        try {
            const { data, error } = await supabase
                .from("logs")
                .select("*")
                .eq("endpoint_id", endpoint.id)
                .order("started_at", { ascending: false })

            if (error) {
                console.error("Error fetching logs for download:", error)
                return
            }

            const flattenObject = (obj: any): any => {
                const flattened: any = {}
                Object.keys(obj).forEach((key) => {
                    if (typeof obj[key] === "object" && obj[key] !== null) {
                        Object.assign(flattened, flattenObject(obj[key]))
                    } else {
                        flattened[key] = obj[key]
                    }
                })
                return flattened
            }

            const processValue = (value: any): string => {
                if (typeof value === "object" && value !== null) {
                    return JSON.stringify(value).replace(/"/g, '""')
                }
                return String(value).replace(/"/g, '""')
            }

            const flattenedData = data.map((row) => flattenObject(row))
            const headers = Array.from(new Set(flattenedData.flatMap(Object.keys)))

            const csvContent = [
                headers.join(","),
                ...flattenedData.map((row) => headers.map((header) => `"${processValue(row[header] ?? "")}"`).join(",")),
            ].join("\n")

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", `logs_${endpoint.id}_${new Date().toISOString()}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error("Error downloading logs:", error)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    if (loading) {
        return <TableSkeleton />
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <CardTitle>Endpoint logs</CardTitle>
                    <CardDescription>Click on log row to expand information</CardDescription>
                </div>
                <div className="flex space-x-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={refreshLogs}>
                                    <RefreshCw className="h-4 w-4" />
                                    <span className="sr-only">Refresh logs</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Refresh logs</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={downloadLogs}>
                                    <Download className="h-4 w-4" />
                                    <span className="sr-only">Download logs</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Download logs</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className={`${selectedLog ? "w-full md:w-3/5" : "w-full"} transition-all duration-300 ease-in-out`}>
                    <div className="flex flex-col">
                        <DataTable columns={columns} data={logs} onRowClick={(log) => setSelectedLog(log)} placeholder='No logs...' />
                        {hasMore && (
                            <div className="mt-4 w-full">
                                <Button className="w-full" variant="default" onClick={() => fetchLogs(true)} disabled={loadingMore}>
                                    {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {loadingMore ? "Loading..." : "Load More"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                {selectedLog && (
                    <div className="w-full md:w-2/5">
                        <LogCard log={selectedLog} onClose={() => setSelectedLog(null)} />
                    </div>
                )}
            </div>
        </div>
    )
}

