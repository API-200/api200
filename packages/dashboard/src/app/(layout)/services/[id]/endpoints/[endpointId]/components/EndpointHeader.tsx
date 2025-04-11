import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Tables } from "@/utils/supabase/database.types";
import { MethodBadge } from "@/components/MethodBadge";
import { ColorSquare } from "@/components/ColorSquare";
import { UrlCopy } from "@/app/(layout)/services/[id]/endpoints/[endpointId]/components/UrlCopy";
import Link from "next/link";
import { env } from "next-runtime-env";
import InfoTooltip from '@/components/ui/info-tooltip';

interface EndpointHeaderProps {
    endpoint: Tables<'endpoints'>
    service: Tables<'services'>
}

export function EndpointHeader({ endpoint, service }: EndpointHeaderProps) {
    const apiUrl = `${env('NEXT_PUBLIC_BACKEND_URL')}/api/${service.name}${endpoint.name}`

    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <div className="flex gap-3 items-center flex-row mb-4">
                    <ColorSquare big name={service.name} />
                    <h1 className="text-3xl font-bold tracking-tight">{endpoint.name}</h1>
                    <MethodBadge method={endpoint.method} />
                    {endpoint.description && <InfoTooltip text={endpoint.description} />}
                </div>
                <p className="text-gray-600 mb-2">Endpoint URL: {endpoint.full_url}</p>
                <div className="flex items-center space-x-2">
                    {endpoint.method.toLowerCase() === 'get' && <Badge
                        variant={endpoint.cache_enabled ? "outline" : "secondary"}>Cache {endpoint.cache_enabled ? "Enabled" : "Disabled"}</Badge>
                    }
                    <Badge
                        variant={endpoint.mock_enabled ? "outline" : "secondary"}>Mock {endpoint.mock_enabled ? "Enabled" : "Disabled"}</Badge>
                    <Badge variant={endpoint.fallback_response_enabled ? "outline" : "secondary"}>
                        Fallback {endpoint.fallback_response_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Badge variant={endpoint.data_mapping_enabled ? "outline" : "secondary"}>
                        Data Mapping {endpoint.data_mapping_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                </div>
                <UrlCopy url={apiUrl} />
            </div>
            <Link href={'/specification'}>
                <Button>
                    Test Endpoint
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        </div>
    )
}
