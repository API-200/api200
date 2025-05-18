import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { PLANS } from '@/utils/constants';
import { Badge } from '@/components/ui/badge';

export function UsageProgressBar() {
    const [usages, setUsages] = useState<number>(0)
    const [percentage, setPercentage] = useState<number>(0)
    const [maxRequestsPerMonth, setMaxRequestsPerMonth] = useState<number>(0)
    const [isPro, setIsPro] = useState<boolean>(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data } = await supabase.from('usages').select().maybeSingle()
            setUsages(data?.calls_count ?? 0)

            const user = await supabase.auth.getUser()
            const { data: proSubscriptionExists } = await supabase.rpc('check_subscription', { p_user_id: user.data.user?.id })

            setIsPro(proSubscriptionExists)
            setMaxRequestsPerMonth(proSubscriptionExists ? PLANS.PRO.REQUESTS_PER_MONTH : PLANS.BASIC.REQUESTS_PER_MONTH)
            setPercentage(Math.min((usages / maxRequestsPerMonth) * 100, 100))
        }
        fetchData()
    }, [])

    return (
        <div className="px-4 space-y-2">
            <div className="flex justify-between text-sm">
                <span>Requests this month</span>
                <span>
                    {usages} / {maxRequestsPerMonth}
                </span>
            </div>
            <Progress value={percentage} className="w-full" />
            {isPro && <Badge>Pro</Badge>}
        </div>
    )
}

