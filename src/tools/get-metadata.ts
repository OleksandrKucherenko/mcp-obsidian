import type { IObsidianAPI, ToolResponse } from "../types"
import { BaseTool } from "./base-tool"

export class GetMetadataTool extends BaseTool {
  constructor(api: IObsidianAPI) {
    super(api, "getMetadata", "Get metadata for a specific note", {
      type: "object",
      required: ["path"],
      properties: {
        path: {
          type: "string",
          description: "Path to the note to get metadata from",
        },
      },
    })
  }

  async execute(args: { path: string }): Promise<ToolResponse> {
    const metadata = await this.api.getMetadata(args.path)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(metadata, null, 2),
        },
      ],
    }
  }
}
