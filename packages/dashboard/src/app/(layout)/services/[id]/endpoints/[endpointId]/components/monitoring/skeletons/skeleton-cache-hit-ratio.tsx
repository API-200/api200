import { Database } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCacheHitRatio() {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium">Cache Hit Ratio</CardTitle>
        <CardDescription>Cache hits vs total requests</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <div className="flex flex-col items-center justify-center h-48">
          <div className="relative flex items-center justify-center">
            <Database className="h-12 w-12 text-muted-foreground/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-muted-foreground">
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

