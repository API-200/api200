import { createClient } from "@/utils/supabase/server";
import { generateApiKey } from "@/utils/generateApiKey";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiKeyDisplay } from "./components/ApiKeyDisplay";
import { env } from "next-runtime-env";

export default async function PrivatePage() {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()

    let { data: apiKey } = await supabase.from("api_keys").select().eq("user_id", user?.user?.id).single()

    if (!apiKey) {
        const newKey = generateApiKey()
        const { data, error } = await supabase
            .from("api_keys")
            .insert({ user_id: user?.user?.id, key: newKey })
            .select()
            .single()

        if (error) {
            console.error("Error creating new API key:", error)
        } else {
            apiKey = data
        }
    }


    return <div className="container mx-auto">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Credentials</h1>
                <p className="text-muted-foreground">
                    Use this key in your application code to authenticate requests to API 200</p>
            </div>
        </div>
        <Separator className="my-4" />
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Your API Key</CardTitle>
                        <CardDescription>Use this key to authenticate your requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ApiKeyDisplay />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>API Key Usage</CardTitle>
                        <CardDescription>How to authenticate your API requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">
                            To authenticate your requests to <code className="bg-gray-100 rounded-md font-mono text-sm p-1">{env('NEXT_PUBLIC_BACKEND_URL')}/api</code>, set the following header:
                        </p>
                        <pre className="mt-2 flex-grow p-2 bg-gray-100 rounded-md font-mono text-sm">
                            <code>x-api-key</code>
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </div>
        <div>
        </div>
    </div>
}
