import { Server, ServerTransport } from './types';
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

export class StdioServerTransport implements ServerTransport {
  async connect(): Promise<void> {
    // Implementation for stdin/stdout communication
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (data) => {
      // Handle incoming data
      console.log(data.toString());
    });
  }
}

export class ObsidianMCPServer implements Server {
  public config: {
    name: string;
    version: string;
  };
  private api: ObsidianAPI;
  private tools: Map<string, any>;

  constructor(config: ServerConfig) {
    this.config = {
      name: config.name,
      version: config.version,
    };

    this.api = new ObsidianAPI(config.obsidian);
    this.tools = new Map();
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
      this.registerTool(tool);
    });
  }

  public registerTool(tool: any): void {
    this.tools.set(tool.getName(), tool);
  }

  public async connect(transport: ServerTransport): Promise<void> {
    await transport.connect();
    console.error(`${this.config.name} MCP Server running on stdio`);
  }

  public async start() {
    const transport = new StdioServerTransport();
    await this.connect(transport);
  }
}