import { BaseTool, type ToolResponse } from "./base-tool"
import type { IObsidianAPI } from "../types"

export class ListNotesTool extends BaseTool {
  constructor(api: IObsidianAPI) {
    super(api, "listNotes", "List all notes in the vault or a specific folder", {
      type: "object",
      properties: {
        folder: {
          type: "string",
          description: "Optional folder path to list notes from",
        },
      },
    })
  }

  async execute(args: { folder?: string }): Promise<ToolResponse> {
    const notes = await this.api.listNotes(args.folder)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(notes, null, 2),
        },
      ],
    }
  }
}
