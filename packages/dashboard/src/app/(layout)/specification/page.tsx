import {createClient} from "@/utils/supabase/server";
import dynamic from 'next/dynamic'
import { generateSwaggerSpec } from "@/utils/generateSwaggerSpec";
import SwaggerSkeletonLoader from "@/app/(layout)/specification/components/SwaggerSkeletonLoader";
const DynamicApiDocs = dynamic(() => import('./components/SwaggerViewer'), {
    loading: SwaggerSkeletonLoader,
})

export default async function PrivatePage() {
    const supabase = await createClient()
    const {data: user} = await supabase.auth.getUser()
    const {data: services} = await supabase
        .from('services')
        .select()
        .eq('user_id', user?.user?.id as string)
    const {data: endpoints} = await supabase
        .from('endpoints')
        .select()

    const title = `API200 - ${user.user?.email} Specification`

    const spec = generateSwaggerSpec(services!, endpoints!, title)

    return <div>
        <DynamicApiDocs spec={spec}/>
    </div>
}
