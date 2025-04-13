import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";

const main = async () => {

    const server = new McpServer({
        name: "Demo",
        version: "1.0.0"
    });

    try {
        const userKey = "022fad02fed409a185c42c4416cea7c0"

        const response = await fetch('http://localhost:8080/user/mcp-services', {
            headers: {
                "x-api-key": userKey!
            }
        })
        const data = await response.json();

        data.forEach((service: any) => {
            console.log("service", service)
            service.endpoints.forEach((endpoint: any) => {
                console.log("endpoint.schema", endpoint.schema)
                server.tool(
                    endpoint.name,
                    `${endpoint.description} - Will call ${endpoint.full_url}`,
                    {},
                    () => {
                        return {content: [{type: "text", text: "PLACEHOLDER"}]}
                    }
                )
            })
        })

    } catch (error) {
        console.error(error)
    }


    server.tool("add",
        {a: z.number(), b: z.number()},
        async ({a, b}) => ({
            content: [{type: "text", text: String(a + b)}]
        })
    );


// Start receiving messages on stdin and sending messages on stdout
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main()
