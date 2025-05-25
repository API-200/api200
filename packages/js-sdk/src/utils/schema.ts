import { z } from 'zod';

export const envSchema = z.object({
    token: z.string().min(1),
    baseUrl: z.string().url().default("https://eu.api200.co/api"),
    output: z.string().optional()
});

export type Config = z.infer<typeof envSchema>;
