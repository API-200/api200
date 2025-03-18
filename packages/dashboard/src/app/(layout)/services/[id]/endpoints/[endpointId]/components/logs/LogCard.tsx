import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Copy, CopyCheck, X } from "lucide-react"
import type { Tables } from "@/utils/supabase/database.types"
import { format } from "date-fns"
import { MethodBadge } from "@/components/MethodBadge"
import { StatusBadge } from "@/components/StatusBadge"
import { Badge } from "@/components/ui/badge"

type LogCardProps = {
    log: Tables<"logs"> & { endpoint: Tables<"endpoints"> }
    onClose: () => void
}

function formatDuration(ms: number): string {
    if (ms >= 1000) {
        return `${(ms / 1000).toFixed(2)}s`
    }
    return `${ms}ms`
}

function JsonDisplay({ data }: { data: unknown }) {
    const [isCopied, setIsCopied] = useState(false)
    const jsonString = JSON.stringify(data, null, 2)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(jsonString)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy JSON:", err)
        }
    }

    return (
        <div className="relative">
            <pre className="text-xs overflow-auto min-h-12 max-h-72 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                <code>{jsonString}</code>
            </pre>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleCopy}>
                {isCopied ? <CopyCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy JSON</span>
            </Button>
        </div>
    )
}

export function LogCard({ log, onClose }: LogCardProps) {
    return (
        <Card className="w-full shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg">{log.correlation_id}</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span>
                            <MethodBadge method={log.endpoint.method} /> {log.req_url}
                        </span>
                        <StatusBadge status={log.res_code!} />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <div className="flex gap-2">
                            <div>Start: {format(new Date(log.started_at), "MMM dd HH:mm:ss.SS")}</div>
                            <div>|</div>
                            <div>Finish: {format(new Date(log.finished_at), "MMM dd HH:mm:ss.SS")}</div>
                        </div>
                        <div>Duration: {formatDuration(log.took_ms!)}</div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <div>
                            Requested from IP: <span className="font-mono ml-2">{log.ip}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {log.is_mock_response && <Badge variant="destructive">Returned mocked response</Badge>}
                        {log.cache_hit && <Badge variant="outline">Returned cached response</Badge>}
                        {log.retry_number && <Badge variant="destructive">Retries: {log.retry_number}</Badge>}
                        {log.is_fallback_response && <Badge variant="destructive">Returned fallback response</Badge>}
                        {log.error && <Badge variant="destructive">Error</Badge>}
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="req-body">
                            <AccordionTrigger className="text-sm font-medium">Request Body</AccordionTrigger>
                            <AccordionContent>
                                <JsonDisplay data={log.req_body} />
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="req-headers">
                            <AccordionTrigger className="text-sm font-medium">Request Headers</AccordionTrigger>
                            <AccordionContent>
                                <JsonDisplay data={log.req_headers} />
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="res-body">
                            <AccordionTrigger className="text-sm font-medium">Response Body</AccordionTrigger>
                            <AccordionContent>
                                <JsonDisplay data={log.res_body} />
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="res-headers">
                            <AccordionTrigger className="text-sm font-medium">Response Headers</AccordionTrigger>
                            <AccordionContent>
                                <JsonDisplay data={log.res_headers} />
                            </AccordionContent>
                        </AccordionItem>

                        {log.error && (
                            <AccordionItem value="error">
                                <AccordionTrigger className="text-sm font-medium">Error</AccordionTrigger>
                                <AccordionContent>
                                    <JsonDisplay data={log.error} />
                                </AccordionContent>
                            </AccordionItem>
                        )}
                    </Accordion>
                </div>
            </CardContent>
        </Card>
    )
}

export default LogCard;
