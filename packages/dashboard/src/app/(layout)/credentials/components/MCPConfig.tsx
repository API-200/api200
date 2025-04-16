"use client"

import {FC, useState} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Copy, CopyCheck} from "lucide-react"
import Link from "next/link";

interface MCPConfigProps {
    apiKey: string
}


export const MCPConfig: FC<MCPConfigProps> = ({apiKey}) => {
    const [isCopied, setIsCopied] = useState(false)

    const config = `{
  "mcpServers": {
    "api200": {
      "command": "npx",
      "args": [
        "api200-mcp@latest"
      ],
      "env": {
        "USER_KEY": "${apiKey}"
      }
    }
  }
}`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(config)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy MCP config:', err)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>MCP Usage</CardTitle>
                <CardDescription>How to use MCP for API 200 </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm">
                    To use API 200 MCP server with your LLM client, add following config (<Link target="_blank" className={"hover:underline text-blue-600"} href="https://modelcontextprotocol.io/quickstart/user">help</Link>):
                </p>
                <pre className="mt-2 flex-grow p-2 bg-gray-100 rounded-md font-mono text-sm relative">
                     <div className="absolute right-2 top-2">
                    <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 w-8 p-0">
                        {isCopied ? (
                            <CopyCheck className="h-4 w-4 text-green-500"/>
                        ) : (
                            <Copy className="h-4 w-4"/>
                        )}
                    </Button>
                </div>
                            <code>
                                {config}
                            </code>
                        </pre>
            </CardContent>
        </Card>
    )
}

export default MCPConfig
