"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {Tables} from "@/utils/supabase/database.types";
import {PLANS} from "@/utils/constants";
import {format} from "date-fns";
import {pro_monthly_id, pro_yearly_id, usePaddle} from "@/hooks/usePaddle";

type Props = {
    subscription: (Tables<'subscriptions'> & Tables<'customers'>) | null;
    usages: number
    customerData: {
        email: string
    }
}

export default function SubscriptionCard({ subscription, usages, customerData }: Props) {
    const {paddle, error, handleUpgrade} = usePaddle();

    const isPro = subscription?.subscription_status === "active";
    const maxRequestsPerMonth = isPro ? PLANS.PRO.REQUESTS_PER_MONTH : PLANS.BASIC.REQUESTS_PER_MONTH

    const usagePercentage = Math.min((usages / maxRequestsPerMonth) * 100, 100)

    // Handle cancel
    const handleCancel = async () => {
        try {
            paddle?.Retain.initCancellationFlow({
                subscriptionId: subscription?.subscription_id!,
            })
        } catch (error) {
            console.error("Error canceling subscription:", error);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-xl flex items-center">
                        <div>
                            {isPro ? "Pro Plan" : "Free Plan"}
                        </div>
                        <div className="flex items-center">
                            {isPro && (
                                <Badge className="ml-3 bg-green-500 hover:bg-green-600">Active</Badge>
                            )}
                        </div>
                    </CardTitle>
                    <CardDescription>
                        {isPro
                            ? `Renews on ${format(new Date(subscription?.next_billed_at), "dd MMM yyyy")} (${subscription?.billing_cycle ? "Monthly" : "Yearly"})`
                            : "Limited features"}
                    </CardDescription>
                </div>
                <div className="flex space-x-2">
                    {isPro ? (
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel Subscription
                        </Button>
                    ) : (
                        <Button onClick={() => handleUpgrade(pro_monthly_id, customerData.email)}>Upgrade</Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="mb-2 flex justify-between items-center">
                    <div className="text-sm text-gray-500">API Requests</div>
                    <div className="text-sm font-medium">
                        {usages} / {maxRequestsPerMonth}
                    </div>
                </div>
                <Progress value={usagePercentage} className="h-2" />
            </CardContent>
        </Card>
    );
}
