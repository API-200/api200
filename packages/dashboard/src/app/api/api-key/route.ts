import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { generateApiKey } from "@/utils/generateApiKey"
import { cache } from "@/utils/redis/cache"

const DAY = 24 * 60 * 60 * 1000;

const generateApiKeyHash = (apiKey: string) => `apikey:${apiKey}`

export async function GET() {
    const supabase = await createClient()
    const userId = (await supabase.auth.getUser())?.data?.user?.id

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase.from("api_keys").select("key").eq("user_id", userId).single()
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ apiKey: data?.key })
}

export async function POST() {
    const supabase = await createClient()
    const userId = (await supabase.auth.getUser())?.data?.user?.id

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { data } = await supabase.from("api_keys").select("key").eq("user_id", userId).single()
    const oldKey = data?.key
    const newKey = generateApiKey()
    const { error } = await supabase.from("api_keys").update({ key: newKey }).eq("user_id", userId)
    if (error) {
        return NextResponse.json({ error: "Failed to reissue API key" }, { status: 500 })
    }
    const cacheKey = generateApiKeyHash(newKey)

    if (oldKey) {
        const oldCacheKey = generateApiKeyHash(oldKey)
        cache.del(oldCacheKey)
    }
    cache.set(cacheKey, { user_id: userId }, DAY)

    return NextResponse.json({ apiKey: newKey })

}

