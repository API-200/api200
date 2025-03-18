import * as Sentry from '@sentry/nextjs';
import FEATURES from "@/config/features";

export async function register() {
  if (process.env.TURBOPACK) {
    return;
  }
  if(!FEATURES.ANALYTICS.ENABLE_SENTRY){
    return
  }
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
