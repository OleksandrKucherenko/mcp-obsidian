import { loadConfig } from "./config"
import { ObsidianAPI } from "./obsidian-api"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { debug } from "debug"
import { z } from "zod"

const config = loadConfig()

const logger = debug("mcp:server")

const api = new ObsidianAPI(config.obsidian)

const server = new McpServer({
  name: config.name,
  version: config.version,
})

server.resource("config", "config://mcp", async (uri) => ({
  contents: [{ uri: uri.href, text: JSON.stringify(config, null, 2) }],
}))

server.tool(
  "listNotes",
  "List all notes in the vault or a specific folder",
  { folder: z.string().optional() },
  async ({ folder }) => {
    const notes = await api.listNotes(folder)

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(notes, null, 2),
        },
      ],
    }
  },
)

const transport = new StdioServerTransport()
await server.connect(transport)

logger(`${config.name} MCP Server running on stdio`)
