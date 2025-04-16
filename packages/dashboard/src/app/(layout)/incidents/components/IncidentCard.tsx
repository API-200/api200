import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {ArrowRight, Check, CheckCheck, X} from "lucide-react"
import {redirect} from 'next/navigation'
import {type EnhancedIncident} from '../types'
import {format} from "date-fns";

type Props = {
    incident: EnhancedIncident
    onClose: () => void
    onResolve: () => void
}

export function IncidentCard({incident, onClose, onResolve}: Props) {
    const goToEndpoint = () => {
        const endpoint = incident.endpoint as EnhancedIncident['endpoint'];
        const service = endpoint.service;
        redirect(`/services/${service.id}/endpoints/${endpoint.id}`)
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>
                    {incident.title}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4"/>
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                    <div className="text-sm">{incident.type || "Unknown"}</div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="text-sm">{incident.resolved ?
                        <div className="flex gap-1 items-center">Resolved <Check className={"h-4 w-4"}/></div> : "Active"}</div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Details</h3>
                    <pre className="mt-2 p-4 rounded-md bg-muted div-4 overflow-auto text-xs">
                        {JSON.stringify(incident.details, null, 2)}
                    </pre>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Occured at</h3>
                    <div className="text-sm">{format(new Date(incident.created_at!), "MMM dd HH:mm:ss")}</div>
                </div>
                <div className="flex gap-2">
                    <Button className="w-full" variant={"outline"} onClick={goToEndpoint}>Go To Endpoint <ArrowRight/></Button>
                    {!incident.resolved && (
                        <Button className="w-full" onClick={onResolve}>
                            Mark as Resolved <CheckCheck/>
                        </Button>
                    )}
                </div>

            </CardContent>
        </Card>
    )
}
