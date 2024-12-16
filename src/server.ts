import { Server } from '@modelcontextprotocol/sdk/server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import { ObsidianAPI } from './obsidian-api';
import { ListNotesTool, ReadNoteTool, WriteNoteTool, SearchNotesTool, GetMetadataTool } from './tools';

export interface ServerConfig {
  name: string;
  version: string;
  obsidian: {
    apiKey: string;
    port: number;
    host: string;
  };
}

export class ObsidianMCPServer {
  private server: Server;
  private api: ObsidianAPI;

  constructor(config: ServerConfig) {
    this.server = new Server(
      {
        name: config.name,
        version: config.version,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.api = new ObsidianAPI(config.obsidian);
    this.registerTools();
  }

  private registerTools() {
    const tools = [
      new ListNotesTool(this.api),
      new ReadNoteTool(this.api),
      new WriteNoteTool(this.api),
      new SearchNotesTool(this.api),
      new GetMetadataTool(this.api)
    ];

    tools.forEach(tool => {
      this.server.registerTool(tool);
    });
  }

  public async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`${this.server.config.name} MCP Server running on stdio`);
  }
}