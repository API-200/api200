"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubscriptionCard({ initialSubscription }) {
    const [subscription, setSubscription] = useState(initialSubscription);

    // Calculate usage percentage
    const usagePercentage = Math.round((subscription.requests.used / subscription.requests.total) * 100);

    // Handle upgrade
    const handleUpgrade = async () => {
        try {
            // In a real app, you would call an API endpoint
            // await fetch('/api/subscription/upgrade', { method: 'POST' });

            setSubscription({
                ...subscription,
                type: "pro",
                requests: {
                    used: subscription.requests.used,
                    total: 10000
                },
                renewalDate: "June 14, 2025",
                billingCycle: "monthly"
            });
        } catch (error) {
            console.error("Error upgrading subscription:", error);
        }
    };

    // Handle cancel
    const handleCancel = async () => {
        if (window.confirm("Are you sure you want to cancel your subscription?")) {
            try {
                // In a real app, you would call an API endpoint
                // await fetch('/api/subscription/cancel', { method: 'POST' });

                setSubscription({
                    ...subscription,
                    type: "free",
                    requests: {
                        used: subscription.requests.used,
                        total: 100
                    }
                });
            } catch (error) {
                console.error("Error canceling subscription:", error);
            }
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-xl flex items-center">
                        <div>
                            {subscription.type === "pro" ? "Pro Plan" : "Free Plan"}
                        </div>
                        <div className="flex items-center">
                            {subscription.type === "pro" && (
                                <Badge className="ml-3 bg-green-500 hover:bg-green-600">Active</Badge>
                            )}
                        </div>
                    </CardTitle>
                    <CardDescription>
                        {subscription.type === "pro"
                            ? `Renews on ${subscription.renewalDate} (${subscription.billingCycle === "monthly" ? "Monthly" : "Yearly"})`
                            : "Limited features"}
                    </CardDescription>
                </div>
                <div className="flex space-x-2">
                    {subscription.type === "pro" ? (
                        <Button variant="outline" onClick={handleCancel}>
                            Cancel Subscription
                        </Button>
                    ) : (
                        <Button onClick={handleUpgrade}>Upgrade</Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="mb-2 flex justify-between items-center">
                    <div className="text-sm text-gray-500">API Requests</div>
                    <div className="text-sm font-medium">
                        {subscription.requests.used} / {subscription.requests.total}
                    </div>
                </div>
                <Progress value={usagePercentage} className="h-2" />
            </CardContent>
        </Card>
    );
}
