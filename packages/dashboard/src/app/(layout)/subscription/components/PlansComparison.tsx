"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {CheckCircle, XCircle} from "lucide-react";

export default function PlansComparison({initialSubscription}) {
    const [subscription, setSubscription] = useState(initialSubscription);
    const [billingCycle, setBillingCycle] = useState(initialSubscription.billingCycle);

    // Handle upgrade
    const handleUpgrade = async () => {
        try {
            // In a real app, you would call an API endpoint
            // await fetch('/api/subscription/upgrade', {
            //   method: 'POST',
            //   body: JSON.stringify({ plan: 'pro', billingCycle })
            // });

            setSubscription({
                ...subscription,
                type: "pro",
                requests: {
                    used: subscription.requests.used,
                    total: 10000
                },
                billingCycle: billingCycle,
                renewalDate: billingCycle === "monthly" ? "June 14, 2025" : "May 14, 2026"
            });
        } catch (error) {
            console.error("Error upgrading subscription:", error);
        }
    };

    // Toggle billing cycle
    const changeBillingCycle = (cycle) => {
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
                {/* Free Plan */}
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
                                <span>10,000 API requests per month</span>
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
                        {subscription.type === "pro" ? (
                            <Button disabled variant="outline" className="w-full">Current Plan</Button>
                        ) : (
                            <Button onClick={handleUpgrade} className="w-full">Upgrade Now</Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
