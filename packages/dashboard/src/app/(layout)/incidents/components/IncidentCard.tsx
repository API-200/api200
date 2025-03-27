import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import type { Tables } from "@/utils/supabase/database.types"

type Props = {
    incident: Tables<"incidents"> & { endpoint: Tables<"endpoints"> }
    onClose: () => void
    onResolve: () => void
}

export function IncidentCard({ incident, onClose, onResolve }: Props) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                    {incident.title}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                    <p>{incident.type || "Unknown"}</p>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <p>{incident.handled ? "Resolved" : "Active"}</p>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Details</h3>
                    <pre className="mt-2 rounded-md bg-muted p-4 overflow-auto">
                        {JSON.stringify(incident.details, null, 2)}
                    </pre>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                    <p>{new Date(incident.created_at!).toLocaleString()}</p>
                </div>

                {!incident.handled && (
                    <Button className="w-full" onClick={onResolve}>
                        Mark as Resolved
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}