import { Skeleton } from "../../../../components/ui/skeleton"
import { Button } from "../../../../components/ui/button"
import { PlusCircle } from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "../../../../components/ui/breadcrumb"
import { ChevronRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs"

export default function Loading() {
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
                        <Skeleton className="h-4 w-24" />
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex justify-between items-center mb-6">
                <div className="mb-6">
                    <Skeleton className="h-9 w-64 mb-2" />
                    <Skeleton className="h-5 w-96 mb-2" />
                    <Skeleton className="h-4 w-72 mb-2" />
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                </div>
                <Button className="flex items-center" disabled>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Endpoint
                </Button>
            </div>

            <Tabs defaultValue="endpoints" className="mt-6">
                <TabsList className="mb-4">
                    <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                    <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="endpoints">
                    <div className="space-y-4">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="flex items-center space-x-4 w-full">
                                <Skeleton className="h-10 w-10" />
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-4 w-64" />
                                <Skeleton className="h-9 w-32 ml-auto" />
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

