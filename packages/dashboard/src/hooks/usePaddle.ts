import { env } from "next-runtime-env";
import {useCallback, useEffect, useState } from "react";
import {initializePaddle, Paddle} from "@paddle/paddle-js";


const environment = env('NEXT_PUBLIC_PADDLE_ENV') as "sandbox";
const token = env('NEXT_PUBLIC_PADDLE_CLIENT_TOKEN')!;

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

    return { paddle, openCheckout, error } as const;
}
