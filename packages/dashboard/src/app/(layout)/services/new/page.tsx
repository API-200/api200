import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {ChevronRight, Import} from "lucide-react";
import {APIServiceForm} from "@/components/forms/APIServiceForm";
import {Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import Link from "next/link";

export default function NewApiServicePage() {
    return (
        <div className="container mx-auto">
            <div className="w-full lg:w-2/3 mx-auto">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/services">Services</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator>
                            <ChevronRight className="h-4 w-4"/>
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbPage>New</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <Alert className="mb-4">
                    <Import className="h-4 w-4" />
                    <AlertTitle>No manual work!</AlertTitle>
                    <AlertDescription>
                        You can import service and endpoints from OpenAPI/Swagger or Postman collection.
                    </AlertDescription>
                    <Link href={`/services/import`} passHref>
                        <Button className={"mt-2"} variant={"outline"} size={"sm"}>
                            Import Endpoints
                        </Button>
                    </Link>
                </Alert>

                <APIServiceForm mode={'create'}/>
            </div>
        </div>
    )
}
