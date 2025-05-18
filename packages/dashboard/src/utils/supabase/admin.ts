import { createClient } from '@supabase/supabase-js'
import {env} from "next-runtime-env";

export async function UNSAFE_createAdminClient() {

    return createClient(
        env('NEXT_PUBLIC_SUPABASE_URL')!,
        process.env.SUPABASE_SERVICE_ROLE!,
    )
}
