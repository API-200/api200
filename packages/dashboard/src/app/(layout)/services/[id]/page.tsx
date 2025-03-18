import {createClient} from "../../../../utils/supabase/server";
import {ServiceHeader} from "./components/ServiceHeader";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "../../../../components/ui/breadcrumb";
import {ChevronRight, Construction} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../../../../components/ui/tabs";
import {EndpointsTab} from "src/app/(layout)/services/[id]/components/EndpointsTab";
import {APIServiceForm} from "../../../../components/forms/APIServiceForm";
import DeleteServiceForm from "../../../../components/forms/DeleteServiceForm";

type Args = {
    params: Promise<{ id: string }>
}

export default async function PrivatePage({params}: Args) {
    const serviceId = (await params).id;
    const supabase = await createClient()
    const {data: user} = await supabase.auth.getUser()
    const servicePromise = supabase
        .from('services')
        .select()
        .eq('id', serviceId)
        .eq('user_id', user?.user?.id as string)
        .single()
    const endpointsPromise = await supabase
        .from('endpoints')
        .select()
        .eq('service_id', serviceId)

    const [{data: service}, {
        data: endpoints,
    }] = await Promise.all([servicePromise, endpointsPromise])

    const isValidAuth = !service.auth_enabled ||
        (service.auth_type === "api_key" && service.auth_config?.api_key) ||
        (service.auth_type === "token" && service.auth_config?.bearer_token)

    return (
        <div className="container mx-auto">
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/services">Services</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4"/>
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                        <BreadcrumbPage>{service.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <ServiceHeader isValidAuth={isValidAuth} service={service}/>
            <Tabs defaultValue="endpoints" className="mt-6">
                <TabsList className="mb-4">
                    <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                    <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="endpoints">
                    <EndpointsTab endpoints={endpoints} service={service}/>
                </TabsContent>
                <TabsContent value="monitoring">
                    <div className="flex flex-col items-center justify-center py-12">
                        <Construction className="w-16 h-16 text-yellow-500 mb-4"/>
                        <h2 className="text-2xl font-semibold mb-2">Service Monitoring Coming Soon</h2>
                        <p className="text-gray-600">We&#39;re working hard to bring you powerful monitoring tools.</p>
                    </div>
                </TabsContent>
                <TabsContent value="settings">
                    <div className="w-full lg:w-2/3 mx-auto">
                        <APIServiceForm mode={'update'} initialData={service}/>
                        <div className="mt-4">
                            <DeleteServiceForm id={service.id} name={service.name}/>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
