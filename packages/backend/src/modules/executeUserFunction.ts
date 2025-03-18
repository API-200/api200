import Sentry from '@sentry/node';

export async function executeUserFunction(
    code: string,
    data: any,
): Promise<any> {
    // Validate inputs
    if (typeof code !== 'string' || code.length === 0) {
        throw new Error('API200 Error: Invalid code input');
    }

    // Create a secure context with only whitelisted globals
    const secureContext = {
        Array,
        Object,
        Number,
        String,
        Boolean,
        Date,
        Math,
        JSON,
        undefined,
        null: null,
        NaN,
        Infinity,
        console: {
            log: (...args: any[]) => {
                // Optional: implement logging with rate limiting
                console.log('User code:', ...args);
            },
        },
    };

    try {
        // Create a proxy to prevent access to constructor
        const secureProxy = new Proxy(secureContext, {
            get(target, prop) {
                if (prop === 'constructor' || prop === 'prototype') {
                    throw new Error(
                        'Access to constructor and prototype is forbidden',
                    );
                }
                return target[prop as keyof typeof target];
            },
            set() {
                throw new Error('Modifying context is not allowed');
            },
            has(target, prop) {
                return prop in target;
            },
        });

        // Memory usage check
        const memoryLimit = 100 * 1024 * 1024; // 100MB
        if (process.memoryUsage().heapUsed > memoryLimit) {
            throw new Error('Memory limit exceeded');
        }

        // Create function with restricted context
        const userTransform = new Function(
            'data',
            'context',
            `
            'use strict';
            // Prevent access to global scope
            const global = undefined;
            const window = undefined;
            const process = undefined;
            const require = undefined;
            const module = undefined;
            const __dirname = undefined;
            const __filename = undefined;

            // Block network-related APIs
            const fetch = undefined;
            const XMLHttpRequest = undefined;
            const WebSocket = undefined;
            const EventSource = undefined;
            const Request = undefined;
            const Response = undefined;
            const Headers = undefined;
            const navigator = undefined;

            // Block setTimeout/setInterval
            const setTimeout = undefined;
            const setInterval = undefined;
            const clearTimeout = undefined;
            const clearInterval = undefined;

            // Destructure allowed globals from context
            const {
                Array, Object, Number, String, Boolean,
                Date, Math, JSON, console
            } = context;

            const transform = ${code};
            
            // Validate that transform is a function
            if (typeof transform !== 'function') {
                throw new Error('Code must define a function');
            }

            return transform(data);
            `,
        );

        return Promise.race([
            userTransform(data, secureProxy),
            new Promise((_, reject) =>
                setTimeout(
                    () =>
                        reject(
                            new Error(
                                'API200 Error: Data transformation timeout. Function ran more than 1000ms',
                            ),
                        ),
                    1000,
                ),
            ),
            new Promise((_, reject) => {
                const interval = setInterval(() => {
                    if (process.memoryUsage().heapUsed > memoryLimit) {
                        clearInterval(interval);
                        reject(
                            new Error(
                                'API200 Error: Memory limit exceeded during execution',
                            ),
                        );
                    }
                }, 100);

                setTimeout(() => clearInterval(interval), 1000);
            }),
        ]);
    } catch (error) {
        Sentry.captureException(error);
        throw new Error(
            `API200 Error: Data transformation execution failed: ${(error as Error).message}`,
        );
    }
}
