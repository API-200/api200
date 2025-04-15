import './utils/instrument'
import Koa from 'koa';
import Router from 'koa-router';
import { createApiHandlerRouter } from './api-handler';
import { config } from './utils/config';
import bodyParser from 'koa-bodyparser';
import { createTestRouter } from './test/test-api-handler';
import Sentry from '@sentry/node';
import cors from '@koa/cors';
import { createUserRouter } from './user-router';

const app = new Koa({ proxy: true });
app.use(cors());
Sentry.setupKoaErrorHandler(app);
app.use(bodyParser());

const router = new Router();

const isDevelopment = process.env.NODE_ENV === 'development';

const apiHandler = createApiHandlerRouter();
const userRouter = createUserRouter();
const testRouter = createTestRouter();

app.use(apiHandler.routes()).use(apiHandler.allowedMethods());
app.use(userRouter.routes()).use(userRouter.allowedMethods());

if (isDevelopment) {
  app.use(testRouter.routes()).use(testRouter.allowedMethods());
}

// Routes
router.get('/', (ctx) => {
  ctx.body = `
    <html>
      <body>
        <h1>Welcome to api200!</h1>
        <p>Server is running</p>
      </body>
    </html>
  `;
});

router.get('/healthcheck', (ctx) => {
  ctx.body = {
    status: 'OK',
    timestamp: new Date().toISOString(),
  };
});

// Apply routes
app.use(router.routes()).use(router.allowedMethods());

// Start the server
const server = app.listen(config.PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${config.PORT}`);
});

// // Graceful shutdown
// process.on('SIGTERM', () => {
//     console.log('🛑 SIGTERM received. Shutting down gracefully');
//     server.close(() => {
//         console.log('💤 Process terminated');
//     });
// });
