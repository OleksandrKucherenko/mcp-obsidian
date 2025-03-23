import type { Server as Srv, ServerTransport, Tool } from "./types"
import { ObsidianAPI } from "./obsidian-api"

import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { CallToolRequestSchema, ListToolsRequestSchema, ToolSchema } from "@modelcontextprotocol/sdk/types.js"

import { ListNotesTool, ReadNoteTool, WriteNoteTool, SearchNotesTool, GetMetadataTool } from "./tools"

export interface ServerConfig {
  name: string
  version: string
  readOnly: boolean
  obsidian: {
    apiKey: string
    port: number
    host: string
  }
}

export class ObsidianMCPServer implements Srv {
  public config: {
    name: string
    version: string
    readOnly: boolean
  }
  private api: ObsidianAPI
  private tools: Map<string, Tool>
  private server: Server

  constructor(config: ServerConfig) {
    this.config = {
      name: config.name,
      version: config.version,
      readOnly: config.readOnly,
    }

    this.api = new ObsidianAPI(config.obsidian)
    this.tools = new Map()
    this.registerTools()

    this.server = new Server(
      {
        name: config.name,
        version: config.version,
      },
      {
        capabilities: {
          tools: {},
        },
      },
    )

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = [...this.tools.values()].map((tool) => tool.getDefinition())

      return { tools }
    })

    // @ts-ignore
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params
        const tool = <Tool>this.tools.get(name)

        const reply = await tool.execute(args as Record<string, unknown>)

        return reply
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)

        return {
          content: [{ type: "text", text: `Error: ${errorMessage}` }],
          isError: true,
        }
      }
    })
  }

  private registerTools() {
    const tools = [
      // Readonly tools
      new ListNotesTool(this.api),
      new ReadNoteTool(this.api),
      new SearchNotesTool(this.api),
      new GetMetadataTool(this.api),
      // Write tools
      ...(!this.config.readOnly ? [new WriteNoteTool(this.api)] : []),
    ]

    for (const tool of tools) {
      this.registerTool(tool)
    }
  }

  public registerTool(tool: Tool): void {
    this.tools.set(tool.getName(), tool)
  }

  public async connect(transport: ServerTransport): Promise<void> {
    // do nothing
  }

  public async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)

    console.error(`${this.config.name} MCP Server running on stdio`)
  }
}
