import { env } from "next-runtime-env";
import {useCallback, useEffect, useState } from "react";
import {initializePaddle, Paddle} from "@paddle/paddle-js";


const environment = env('NEXT_PUBLIC_PADDLE_ENV') as "sandbox";
const token = env('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN')!;

export const pro_monthly_id = "pri_01jvj6fb5bmpvyke0c6v23sv2a"
export const pro_yearly_id = "pri_01jvj6gh0wenwg2drzdk3dd6y2"


export function usePaddle() {
    const [paddle, setPaddle] = useState<Paddle | null>(null);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;

        initializePaddle({ environment, token })
            .then((instance) => {
                if (isMounted && instance) {
                    setPaddle(instance);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setError(err as Error);
                    console.error('Failed to initialize Paddle:', err);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const openCheckout = useCallback(
        (options: Parameters<Paddle['Checkout']['open']>[0]) => {
            if (!paddle) {
                console.warn('Paddle not initialized yet');
                return;
            }
            paddle.Checkout.open(options);
        },
        [paddle]
    );

    const handleUpgrade = async (priceId: string, email: string) => {
        try {
            openCheckout({
                customer: {
                    email
                },
                items: [{
                    quantity: 1,
                    priceId
                }],
                settings:{
                    successUrl: window.location.href
                }
            })
        } catch (error) {
            console.error("Error upgrading subscription:", error);
        }
    };

    return { paddle, handleUpgrade, error } as const;
}
