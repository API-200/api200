import { Separator } from "@/components/ui/separator";
import SubscriptionCard from "./components/SubscriptionCard";
import PlansComparison from "./components/PlansComparison";
import {createClient} from "@/utils/supabase/server";

export default async function SubscriptionPage() {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser()
    // In a real app, you would fetch this data server-side
    const userData = {
        subscription: {
            type: "free", // "free" or "pro"
            requests: {
                used: 2345,
                total: 10000
            },
            renewalDate: "June 14, 2025",
            billingCycle: "yearly" // "monthly" or "yearly"
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Manage Subscription</h1>
                </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-6">
                {/* Current Subscription Section */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
                    <SubscriptionCard initialSubscription={userData.subscription} />
                </div>

                {/* Plans Comparison Section */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Plans Comparison</h2>
                    <PlansComparison initialSubscription={userData.subscription} customerData={{
                        email: user?.email!,
                    }} />
                </div>
            </div>
        </div>
    );
}
