import type { Tool } from "../types"
import type { IObsidianAPI } from "../types"

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

export abstract class BaseTool implements Tool {
  protected api: IObsidianAPI
  protected name: string
  protected description: string
  protected inputSchema: object

  constructor(api: IObsidianAPI, name: string, description: string, inputSchema: object) {
    this.api = api
    this.name = name
    this.description = description
    this.inputSchema = inputSchema
  }

  getName(): string {
    return this.name
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    }
  }

  abstract execute(args: unknown): Promise<ToolResponse>
}
