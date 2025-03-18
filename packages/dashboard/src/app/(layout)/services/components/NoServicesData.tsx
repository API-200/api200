import {Button} from "../../../../components/ui/button"
import {Import, PlusCircle} from "lucide-react"
import Link from 'next/link'


export function NoServicesData() {
    return (
        <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">No services found</h3>
            <p className="text-gray-600 mb-4">Create your first service to get started. <br/> Or import from
                OpenAPI/Swagger, Postman,</p>
            <Link href={`/services/new`} passHref>
                <Button className="mr-4">
                    <PlusCircle className="mr-2 h-4 w-4"/> Create Service
                </Button>
            </Link>
            <Button variant="outline" asChild>
                <Link href="/services/import">
                    <Import className="mr-2 h-4 w-4"/> Import Endpoints
                </Link>
            </Button>
        </div>
    )
}

