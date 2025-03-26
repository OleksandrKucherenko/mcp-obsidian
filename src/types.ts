// import { ToolSchema } from "@modelcontextprotocol/sdk/types.js";
// import { z } from "zod";
// const ToolInputSchema = ToolSchema.shape.inputSchema;
// export type ToolInput = z.infer<typeof ToolInputSchema>;

/** Configuration for connecting to the Obsidian API. */
export interface ObsidianConfig {
  apiKey: string
  port: number
  host: string
}

/** Represents a note in Obsidian. */
export interface Note {
  path: string
  content: string
  metadata?: Record<string, unknown>
}

/**
 * Interface defining the contract for Obsidian API implementations
 * This allows v2 to be a drop-in replacement for v1 while maintaining correct API integration
 */
export interface IObsidianAPI {
  listNotes(folder?: string): Promise<string[]>
  readNote(path: string): Promise<Note>
  writeNote(path: string, content: string): Promise<void>
  searchNotes(query: string, contextLength?: number): Promise<Note[]>
  getMetadata(path: string): Promise<Record<string, unknown>>
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

export interface Tool {
  getName(): string
  getDefinition(): ToolDefinition
  execute(args: Record<string, unknown>): Promise<ToolResponse>
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
export interface ToolResponse {
  content: Array<{
    type: string
    text: string
  }>
  isError?: boolean
}
export interface ToolDefinition {
  name: string
  description: string
  inputSchema: object
}
