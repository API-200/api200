import { Separator } from "@/components/ui/separator";
import SubscriptionCard from "./components/SubscriptionCard";
import PlansComparison from "./components/PlansComparison";
import {createClient} from "@/utils/supabase/server";
import { getSubscription } from "@/utils/paddle/getSubscription";

export default async function SubscriptionPage() {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser()
    const { data } = await supabase.from('usages').select().eq('user_id',user?.id as string).maybeSingle()
    const usages = data?.calls_count
    const subscription = await getSubscription()


    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Subscription</h1>
                </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
                    <SubscriptionCard usages={usages} subscription={subscription} customerData={{
                        email: user?.email as string,
                    }} />
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">Plans Comparison</h2>
                    <PlansComparison subscription={subscription} customerData={{
                        email: user?.email as string,
                    }} />
                </div>
            </div>
        </div>
    );
}
