"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {CheckCircle, XCircle} from "lucide-react";
import {pro_monthly_id, pro_yearly_id, usePaddle} from "@/hooks/usePaddle";
import {Tables} from "@/utils/supabase/database.types";


type Props = {
    subscription: (Tables<'subscriptions'> & Tables<'customers'>) | null;
    customerData: {
        email: string
    }
}

export default function PlansComparison({subscription, customerData}: Props) {

    const [billingCycle, setBillingCycle] = useState("monthly");
    const {handleUpgrade} = usePaddle();


    // Toggle billing cycle
    const changeBillingCycle = (cycle: any) => {
        setBillingCycle(cycle);
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                <div className="bg-gray-100 p-1 rounded-md inline-flex items-center">
                    <Button
                        variant={billingCycle === "monthly" ? "default" : "ghost"}
                        className="h-8 text-sm"
                        onClick={() => changeBillingCycle("monthly")}
                    >
                        Monthly
                    </Button>
                    <Button
                        variant={billingCycle === "yearly" ? "default" : "ghost"}
                        className="h-8 text-sm"
                        onClick={() => changeBillingCycle("yearly")}
                    >
                        Yearly (2 months free)
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Free Plan</CardTitle>
                        <CardDescription>Basic features for starters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-2xl font-bold">$0<span
                            className="text-base font-normal text-gray-500">/month</span></div>
                        <ul className="space-y-2">
                            <li className="flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-500"/>
                                <span>100 API requests per month</span>
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-500"/>
                                <span>Basic API gateway functionality</span>
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-500"/>
                                <span>Endpoints to MCP</span>
                            </li>
                            <li className="flex items-center">
                                <XCircle className="mr-2 h-5 w-5 text-gray-300"/>
                                <span>Incidents alerts</span>
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>

                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pro Plan</CardTitle>
                        <CardDescription>Advanced features for professionals</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-row items-center gap-4">
                            <div className="text-2xl font-bold">
                                {billingCycle === "monthly" ? "$20" : "$200"}
                                <span className="text-base font-normal text-gray-500">
                  /{billingCycle === "monthly" ? "month" : "year"}
                </span>
                            </div>
                            {billingCycle === "yearly" && (
                                <div className="text-sm text-green-500 mt-1.5">2 months free</div>
                            )}
                        </div>
                        <ul className="space-y-2">
                            <li className="flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-500"/>
                                <span><span className="font-semibold">10,000</span> API requests per month</span>
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-500"/>
                                <span>Advanced API Gateway functionality</span>
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-500"/>
                                <span>Priority support</span>
                            </li>
                            <li className="flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-500"/>
                                <span>Incident alerts</span>
                            </li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        {subscription?.subscription_status === "active" ? (
                            <Button disabled variant="outline" className="w-full">Current Plan</Button>
                        ) : (
                            <Button
                                onClick={() => handleUpgrade(billingCycle === "yearly" ? pro_yearly_id : pro_monthly_id, customerData.email)}
                                className="w-full">Upgrade Now</Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
