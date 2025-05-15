import { Environment, LogLevel, Paddle, PaddleOptions } from '@paddle/paddle-node-sdk';
import {env} from "next-runtime-env";

export function getPaddleInstance() {
  const paddleOptions: PaddleOptions = {
    environment: (env('NEXT_PUBLIC_PADDLE_ENV') as Environment) ?? Environment.sandbox,
    logLevel: LogLevel.error,
  };

  if (!process.env.PADDLE_API_KEY) {
    console.error('Paddle API key is missing');
  }

  return new Paddle(process.env.PADDLE_API_KEY!, paddleOptions);
}
