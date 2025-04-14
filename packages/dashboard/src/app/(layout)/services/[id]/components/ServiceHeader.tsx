import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, PlusCircle } from "lucide-react";
import { Tables } from "@/utils/supabase/database.types";
import { FC } from "react";
import Link from 'next/link';
import { ColorSquare } from "@/components/ColorSquare";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import InfoTooltip from '@/app/(layout)/services/[id]/endpoints/[endpointId]/components/info-tooltip';

type Props = {
    service: Tables<'services'>
    isValidAuth: boolean
}

export const ServiceHeader: FC<Props> = ({ service, isValidAuth }) => {
    return (
        <div className={"mb-6"}>
            <div className="flex justify-between items-center">
                <div className="mb-6">
                    <div className="flex gap-2 items-center flex-row mb-2">
                        <ColorSquare big name={service.name} />
                        <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
                        {service.description && <InfoTooltip text={service.description} />}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">Base URL: {service.base_url}</p>
                    <div className="flex items-center space-x-2">
                        {service.is_mcp_enabled && <Badge variant="outline">MCP Enabled</Badge>}
                        <Badge variant={service.auth_enabled ? "default" : "secondary"}>
                            Auth {service.auth_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        {service.auth_type && <Badge variant="outline">{service.auth_type}</Badge>}
                    </div>
                </div>
                <Link href={`/endpoints/new?service_id=${service.id}&base_url=${service.base_url}&service_name=${service.name}&user_id=${service.user_id}`} passHref>
                    <Button className="flex items-center">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Endpoint
                    </Button>
                </Link>
            </div>
            {
                !isValidAuth && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Auth is not configured correctly</AlertTitle>
                        <AlertDescription>You probably imported data from specification. Now you need to specify API Key. Go to Settings tab.</AlertDescription>
                    </Alert>
                )
            }
        </div>

    )
}
