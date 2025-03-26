import type { IObsidianAPI, ToolResponse } from "../types"
import { BaseTool } from "./base-tool"

export class SearchNotesTool extends BaseTool {
  constructor(api: IObsidianAPI) {
    super(api, "searchNotes", "Search for notes using a query string", {
      type: "object",
      required: ["query"],
      properties: {
        query: {
          type: "string",
          description: "Search query string",
        },
      },
    })
  }

  async execute(args: { query: string }): Promise<ToolResponse> {
    const results = await this.api.searchNotes(args.query)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2),
        },
      ],
    }
  }
}
