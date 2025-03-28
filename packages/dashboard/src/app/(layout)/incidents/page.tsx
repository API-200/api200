"use client"

import { useEffect, useState, useCallback } from "react"
import { columns } from "./components/columns"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { TableSkeleton } from "@/components/tables/TableSkeleton"
import { AlertCircleIcon, Loader2, RefreshCw } from "lucide-react"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DataTable } from '@/components/tables/DataTable'
import { IncidentCard } from './components/IncidentCard'
import { type EnhancedIncident } from './types'
import FEATURES from '@/config/features'

const PAGE_SIZE = 10

export default function Incidents() {
    const [incidents, setIncidents] = useState<EnhancedIncident[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [selectedIncident, setSelectedIncident] = useState<EnhancedIncident | null>(null)
    const [hasMore, setHasMore] = useState(true)

    const supabase = createClient()

    const fetchIncidents = useCallback(
        async (isLoadMore = false) => {
            if (isLoadMore) {
                setLoadingMore(true)
            } else {
                setLoading(true)
            }

            try {
                const { data: user } = await supabase.auth.getUser()
                const { data: incidentsData, error: incidentsError } = await supabase
                    .from("incidents")
                    .select(`*, endpoint:endpoints(*, service:services(*))`)
                    .eq('endpoint.service.user_id', user.user?.id)
                    .order("created_at", { ascending: false })
                    .range(isLoadMore ? incidents.length : 0, isLoadMore ? incidents.length + PAGE_SIZE : PAGE_SIZE)
                    .limit(PAGE_SIZE + 1)

                if (incidentsError) {
                    console.error("Error fetching incidents:", incidentsError)
                    setHasMore(false)
                } else {
                    setHasMore(incidentsData.length > PAGE_SIZE)
                    const newIncidents = incidentsData.slice(0, PAGE_SIZE)

                    setIncidents(prevIncidents => {
                        if (isLoadMore) {
                            return [...prevIncidents, ...newIncidents]
                        } else {
                            return newIncidents
                        }
                    })
                }
            } catch (error) {
                console.error("Error fetching incidents:", error)
                setHasMore(false)
            }

            if (isLoadMore) {
                setLoadingMore(false)
            } else {
                setLoading(false)
            }
        },
        [supabase, incidents.length]
    )

    const refreshIncidents = () => {
        fetchIncidents()
    }

    const handleResolve = async (incidentId: number) => {
        try {
            const { error } = await supabase
                .from("incidents")
                .update({ resolved: true })
                .eq("id", incidentId)

            if (error) throw error

            setIncidents(prev =>
                prev.map(i => i.id === incidentId ? { ...i, resolved: true } : i)
            )
            if (selectedIncident?.id === incidentId) {
                setSelectedIncident({ ...selectedIncident, resolved: true })
            }
        } catch (error) {
            console.error("Error resolving incident:", error)
        }
    }

    useEffect(() => {
        fetchIncidents()
    }, [fetchIncidents])

    if (loading) {
        return <TableSkeleton />
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <CardTitle>Incidents Explorer</CardTitle>
                    <CardDescription>Click on incident row to view details</CardDescription>
                </div>
                <div className="flex space-x-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={refreshIncidents}>
                                    <RefreshCw className="h-4 w-4" />
                                    <span className="sr-only">Refresh incidents</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Refresh incidents</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <div>
                {!FEATURES.EMAILS && (
                    <div className="flex items-center gap-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
                        <AlertCircleIcon />
                        <div className="text-sm">Be aware that email notifications are not supported in self-hosted version</div>
                    </div>
                )}
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className={`${selectedIncident ? "w-full md:w-3/5" : "w-full"} transition-all duration-300 ease-in-out`}>
                    <div className="flex flex-col">
                        <DataTable
                            columns={columns}
                            data={incidents}
                            onRowClick={(incident) => setSelectedIncident(incident)}
                        />
                        {hasMore && (
                            <div className="mt-4 w-full">
                                <Button className="w-full" variant="default" onClick={() => fetchIncidents(true)} disabled={loadingMore}>
                                    {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {loadingMore ? "Loading..." : "Load More"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                {selectedIncident && (
                    <div className="w-full md:w-2/5">
                        <IncidentCard
                            incident={selectedIncident}
                            onClose={() => setSelectedIncident(null)}
                            onResolve={() => handleResolve(selectedIncident.id)}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}