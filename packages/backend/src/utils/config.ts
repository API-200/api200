import dotenv from 'dotenv';
import { z } from 'zod';
import Sentry from '@sentry/node';

// Load environment variables
dotenv.config();

// Environment variables schema
const envSchema = z.object({
    PORT: z
        .string()
        .transform((val) => parseInt(val, 10))
        .default('8080'),
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
    SUPABASE_URL: z.string().url('Invalid Supabase URL'),
    SUPABASE_SERVICE_ROLE_KEY: z
        .string()
        .min(1, 'Supabase service role key is required'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    REDIS_URL: z.string().url('Invalid Redis URL'),
    ENCRYPTION_KEY: z.string().length(64, 'Encryption key is required and should be 32bytes long'),
    SENTRY_DSN: z.string().optional(),
    IS_SELFHOSTED: z.string().optional()
});

// Validate and parse environment variables
const parseEnvVars = () => {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            Sentry.captureException(error);
            console.error('❌ Environment Variable Validation Failed:');
            error.errors.forEach((err) => {
                console.error(`- ${err.path.join('.')}: ${err.message}`);
            });
            process.exit(1);
        }
        throw error;
    }
};

// Export validated configuration
export const config = parseEnvVars();
