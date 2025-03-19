"use client"

import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Label} from "@/components/ui/label"
import {Badge} from "@/components/ui/badge"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {ParsedSwaggerResult} from "@/app/(layout)/services/import/parseSwagger";
import {MethodBadge} from "@/components/MethodBadge";
import {createClient} from "@/utils/supabase/client";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {toast} from "sonner";
import {Tables} from "@/utils/supabase/database.types";

type Props = {
    data: ParsedSwaggerResult
    onCancel: () => void
}

export default function ImportResults({data, onCancel}: Props) {
    const supabase = createClient()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSave = async () => {
       await onSubmit()
    }

    //TODO move to backend and add transaction
    async function onSubmit() {
        try {
            setIsSubmitting(true)

            const {data: serviceData, error: serviceError} = await supabase
                .from('services')
                .insert(data.service)
                .select()
                .single()

            if(serviceError){
                throw serviceError
            }

            const endpointsToInsert: Tables<'endpoints'>[] = data.endpoints.map(e => ({
                ...e,
                service_id: serviceData.id
            }))

            const {error: endpointsError} = await supabase
                .from('endpoints')
                .insert(endpointsToInsert)

            if(endpointsError){
                throw endpointsError
            }

            if (serviceData?.id) {
                toast.success(`Data imported successfully.`)
                router.push(`/services/${serviceData.id}`)
            }
        } catch (e) {
            toast.error(`Failed to import data.`, {description: (e as Error)?.message})
        } finally {
            setIsSubmitting(false)
        }
    }

    const importMethod = data.service.source

    return (
        <div>
            <div className="flex items-center mb-6">
                <h1 className="text-3xl font-bold">Review Imported Endpoints</h1>
            </div>

            {/* Import Method */}
            <div className="mb-6">
                <h2 className="text-md font-medium mb-2">Import Method</h2>
                <Badge variant="outline" className="text-sm">
                    {importMethod === "openapi"
                        ? "OpenAPI / Swagger"
                        : importMethod === "postman"
                            ? "Postman Collection"
                            : "URL"}
                </Badge>
            </div>

            {/* Service Information */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Service Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-sm text-muted-foreground">Service Name</Label>
                            <p className="font-medium">{data.service.name}</p>
                        </div>
                        <div>
                            <Label className="text-sm text-muted-foreground">Description</Label>
                            <p className="font-medium truncate">{data.service.description}</p>
                        </div>
                        <div>
                            <Label className="text-sm text-muted-foreground">Base URL</Label>
                            <p className="font-medium">{data.service.base_url}</p>
                        </div>
                        <div>
                            <Label className="text-sm text-muted-foreground">Auth</Label>
                            <div className="flex items-center space-x-2">
                                <Badge variant={data.service.auth_enabled ? "default" : "secondary"}>
                                    Auth {data.service.auth_enabled ? "Enabled" : "Disabled"}
                                </Badge>
                                {data.service.auth_type && <Badge variant="outline">{data.service.auth_type}</Badge>}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Endpoints Table */}
            <div className="mb-6">
                <h2 className="text-md font-medium mb-2">Endpoints ({data.endpoints.length})</h2>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name / Path</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Full URL</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.endpoints.map((endpoint, idx) => (
                                <TableRow key={idx}>
                                    <TableCell className="font-medium">{endpoint.name}</TableCell>
                                    <TableCell>
                                        <MethodBadge method={endpoint.method}/>
                                    </TableCell>
                                    <TableCell className="truncate max-w-xs">{endpoint.description}</TableCell>
                                    <TableCell
                                        className="max-w-xs truncate text-muted-foreground">{endpoint.full_url}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
                <Button disabled={isSubmitting} variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button disabled={isSubmitting} onClick={handleSave}>Save</Button>
            </div>
        </div>
    )
}

