import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { debug } from "debug"
import { z } from "zod"

import gm from "./tools/get-metadata.js"
import ls from "./tools/list-notes.js"
import rn from "./tools/read-note.js"
import sn from "./tools/search-notes.js"
import wn from "./tools/write-note.js"

import type { IObsidianAPI, ServerTransport, Server as Srv, Tool } from "./types.ts"
import { ObsidianAPI } from "./obsidian-api.js"

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

type McpServerType = InstanceType<typeof McpServer>

export class ObsidianMCPServer implements Srv {
  public readonly config: {
    name: string
    version: string
    readOnly: boolean
  }
  private readonly logger: ReturnType<typeof debug>
  private readonly api: IObsidianAPI
  private readonly server: McpServerType

  constructor(config: ServerConfig) {
    this.logger = debug("mcp:server")

    this.config = {
      name: config.name,
      version: config.version,
      readOnly: config.readOnly,
    }
    this.api = new ObsidianAPI(config.obsidian)
    this.server = new McpServer({
      name: config.name,
      version: config.version,
    })

    // register tools

    // @ts-ignore
    this.server.tool(ls.name, ls.description, ls.shape, ls.executor(this.api))
    // @ts-ignore
    this.server.tool(rn.name, rn.description, rn.shape, rn.executor(this.api))
    // @ts-ignore
    this.server.tool(sn.name, sn.description, sn.shape, sn.executor(this.api))
    // @ts-ignore
    this.server.tool(gm.name, gm.description, gm.shape, gm.executor(this.api))
    // @ts-ignore
    this.server.tool(wn.name, wn.description, wn.shape, wn.executor(this.api))

    this.api
      .getServerInfo()
      .then((info) => {
        this.logger("Obsidian API info: %O", info)
      })
      .catch((error) => {
        this.logger("Obsidian API error: %O", error)
      })
  }

  public async connect(transport: ServerTransport): Promise<void> {
    // do nothing
  }

  public registerTool(tool: Tool): void {
    // do nothing
  }

  public async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)

    this.logger(`${this.config.name} MCP Server running on stdio`)
  }
}
