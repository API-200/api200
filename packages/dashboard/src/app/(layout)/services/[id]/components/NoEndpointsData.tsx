import { Button } from "../../../../../components/ui/button"
import { Tables } from '../../../../../utils/supabase/database.types'
import { PlusCircle } from "lucide-react"
import Link from 'next/link'

type Props = {
    service: Tables<'services'>
}

export function NoEndpointsData({ service }: Props) {
    return (
        <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">No endpoints found</h3>
            <p className="text-gray-600 mb-4">Create your first endpoint to get started</p>
            <Link href={`/endpoints/new?service_id=${service.id}&base_url=${service.base_url}&service_name=${service.name}&user_id=${service.user_id}`} passHref>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Endpoint
                </Button>
            </Link>
        </div>
    )
}

