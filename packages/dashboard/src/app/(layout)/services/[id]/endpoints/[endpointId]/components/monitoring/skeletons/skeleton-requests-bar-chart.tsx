import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonRequestsBarChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Requests over time</CardTitle>
        <CardDescription>Last 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="h-48 w-full">
            <div className="grid grid-cols-24 gap-2 h-full items-end pt-6 pb-6">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="flex flex-col h-full justify-end">
                  <Skeleton
                    className="w-full"
                    style={{
                      height: `${Math.max(10, Math.floor(Math.random() * 80))}%`,
                    }}
                  />
                  {i % 4 === 0 && <Skeleton className="h-4 w-full mt-2" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

