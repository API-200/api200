import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const MAX_REQUESTS_PER_MONTH = 1000

export function UsageProgressBar() {
    const [usages, setUsages] = useState<number>(0)
    const supabase = createClient()


    useEffect(() => {
        const fetchData = async () => {
            const { data } = await supabase.from('usages').select().maybeSingle()
            setUsages(data?.calls_count ?? 0)
        }
        fetchData()
    }, [supabase]) // Added supabase to the dependency array
    const percentage = Math.min((usages / MAX_REQUESTS_PER_MONTH) * 100, 100)

    return (
        <div className="px-4 space-y-2">
            <div className="flex justify-between text-sm">
                <span>Requests this month</span>
                <span>
                    {usages} / {MAX_REQUESTS_PER_MONTH}
                </span>
            </div>
            <Progress value={percentage} className="w-full" />
        </div>
    )
}

