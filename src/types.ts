// import { ToolSchema } from "@modelcontextprotocol/sdk/types.js";
// import { z } from "zod";
// const ToolInputSchema = ToolSchema.shape.inputSchema;
// export type ToolInput = z.infer<typeof ToolInputSchema>;

export interface Tool {
  getName(): string
  getDefinition(): ToolDefinition
  execute(args: Record<string, unknown>): Promise<ToolResponse>
}

export interface ToolDefinition {
  name: string
  description: string
  inputSchema: object
}

export interface ToolResponse {
  content: Array<{
    type: string
    text: string
  }>
  isError?: boolean
}

export interface Server {
  config: {
    name: string
    version: string
    readOnly: boolean
  }
  connect(transport: ServerTransport): Promise<void>
  registerTool(tool: Tool): void
}

export interface ServerTransport {
  connect(): Promise<void>
}

export interface Config {
  config?: string
}
