import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function Loading() {
    return (
        <div className="container mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Credentials</h1>
                <p className="text-muted-foreground">
                    Use this key in your application code to authenticate requests to API 200</p>
            </div>
            <Separator className="my-4" />
            <div className="bg-gray-100 p-4 rounded-md">
                <div className="flex items-center mb-4">
                    <Skeleton className="flex-grow h-10 rounded-l-md" />
                    <Skeleton className="h-10 w-10 rounded-l-none" />
                </div>
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    )
}
