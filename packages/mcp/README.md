# API200 MCP Server

A Model Context Protocol (MCP) server for API200, allowing seamless integration with Claude Desktop and other MCP clients.

## Installation

```bash
npm install -g api200-mcp
```

Or run directly using npx:

```bash
npx api200-mcp
```

## Configuration

The server requires the following environment variables:

- `USER_KEY` (required): Your API200 API key
- `BASE_API_URL` (optional): Base API URL (defaults to "https://eu.api200.co/api")
- `DEBUG` (optional): Set to "true" to enable debug logging

## Claude Desktop Configuration

To configure the API200 MCP server with Claude Desktop:

1. Open Claude Desktop settings
2. Navigate to Developer settings
3. Add a new custom tool with the following configuration:

```json
{
  "api200": {
    "command": "npx",
    "args": [
      "api200-mcp"
    ],
    "env": {
      "USER_KEY": "your-api-key-here"
    }
  }
}
```

## Usage

Once configured, you can access all your API200 endpoints directly within Claude Desktop or other MCP-compatible clients.

### Running Standalone

You can also run the tool directly from the command line:

```bash
USER_KEY=your-api-key-here npx api200-mcp
```
