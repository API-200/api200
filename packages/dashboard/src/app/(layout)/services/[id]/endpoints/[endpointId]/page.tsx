import { createClient } from "@/utils/supabase/server";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EndpointHeader } from "@/app/(layout)/services/[id]/endpoints/[endpointId]/components/EndpointHeader";
import CodeExample from "@/app/(layout)/services/[id]/endpoints/[endpointId]/components/CodeExample";
import { Logs } from "@/app/(layout)/services/[id]/endpoints/[endpointId]/components/logs/LogViewer";
import { CardDescription, CardTitle } from "@/components/ui/card";
import Settings from './components/SettingsTab';
import { env } from "next-runtime-env";
import EndpointMonitoring from "@/app/(layout)/services/[id]/endpoints/[endpointId]/components/monitoring/Monitoring";
import SchemaTab from './components/SchemaTab';

type Args = {
    params: Promise<{ id: string, endpointId: string }>
}

export default async function PrivatePage({ params }: Args) {
    const serviceId = (await params).id;
    const endpointId = (await params).endpointId;
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()
    const servicePromise = supabase
        .from('services')
        .select()
        .eq('id', serviceId)
        .eq('user_id', user?.user?.id as string)
        .single()
    const endpointPromise = supabase
        .from('endpoints')
        .select()
        .eq('id', endpointId)
        .single()
    const endpointSchemaPromise = supabase
        .from('endpoints_response_schema_history')
        .select('*')
        .eq('endpoint_id', endpointId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    const [
        { data: service },
        { data: endpoint },
        { data: detectedSchema }
    ] = await Promise.all([servicePromise, endpointPromise, endpointSchemaPromise])

    const apiUrl = `${env('NEXT_PUBLIC_BACKEND_URL')}/api/${service.name}${endpoint.name}`

    return (
        <div className="container mx-auto">
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/services">Services</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/services/${serviceId}`}>{service.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                        <BreadcrumbPage>{endpoint.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <EndpointHeader endpoint={endpoint} service={service} />
            <Tabs defaultValue="usage" className="mt-6">
                <TabsList className="mb-4">
                    <TabsTrigger value="usage">Usage</TabsTrigger>
                    <TabsTrigger value="schema">Schema</TabsTrigger>
                    <TabsTrigger value="logs">Logs</TabsTrigger>
                    <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="usage">
                    <CardTitle>Endpoint usage example</CardTitle>
                    <CardDescription className="mb-4">
                        See how you can use endpoint in you application code
                    </CardDescription>
                    <CodeExample url={apiUrl} method={endpoint.method} />
                </TabsContent>
                <TabsContent value="schema">
                    <CardTitle>{endpoint.schema ? "OpenAPI Schema" : "Response schema"}</CardTitle>
                    <CardDescription className="mb-4">
                        {endpoint.schema ? "" : "Determined after the first successful request to the endpoint"}
                    </CardDescription>
                    <SchemaTab schema={endpoint.schema ?? detectedSchema?.schema} />
                </TabsContent>
                <TabsContent value="logs">
                    <Logs endpoint={endpoint} />
                </TabsContent>
                <TabsContent value="monitoring">
                    <EndpointMonitoring endpoint={endpoint} />
                </TabsContent>
                <TabsContent value="settings">
                    <Settings endpoint={endpoint} service={service} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
