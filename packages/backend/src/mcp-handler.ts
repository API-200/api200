import { Context, Next } from "koa";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { Mutex } from "async-mutex";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import Router from "koa-router";
import {validateApiKey} from "@modules/base/apiKeyValidation";

const transports = new Map<string, SSEServerTransport>();
const transportsMutex = new Mutex();


export const createSSERouter = () => {
    const router = new Router();

    // Initialize MCP Server
    const server = new McpServer({
        name: "example-server",
        version: "1.0.0"
    });

    server.tool(
        "get-time",
        "Get current time in ISO format",
        async () => ({
            content: [{
                type: "text",
                text: new Date().toISOString(),
            }]
        })
    );

    router.get("/sse", async (ctx: Context) => {
        console.log("Authorization", ctx.get("Authorization"))

        let keyData: { user_id: string } | null = await validateApiKey(ctx);
        console.log('keyData',keyData)

        // if (!keyData) return;

        ctx.respond = false;
        const transport = new SSEServerTransport("/messages", ctx.res);
        const sessionId = transport.sessionId;
        await transportsMutex.runExclusive(async () => {
            transports.set(sessionId, transport);
        });
        console.log("sse by", sessionId, transports.size);
        ctx.res.on("error", (e) => {
            console.error("error", e);
        });
        ctx.res.on("close", () => {
            console.log("session closed", sessionId);
            transports.delete(sessionId);
            ctx.res.end();
        });
        await server.connect(transport);
        console.log("session connected", sessionId);
    });

    router.post("/messages", async (ctx: Context) => {
        ctx.respond = false;
        const sessionId = ctx.query.sessionId as string;
        let transport: SSEServerTransport | undefined;
        await transportsMutex.runExclusive(async () => {
            console.log("messages by", sessionId, transports.size);
            transport = transports.get(sessionId);
        });
        if (transport) {
            await transport.handlePostMessage(ctx.req, ctx.res, ctx.request.body);
        } else {
            ctx.status = 404;
            ctx.body = `Transport not found for session ID ${sessionId}`;
        }
    });

    return router;
};
