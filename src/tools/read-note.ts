import { BaseTool, type ToolResponse } from "./base-tool"
import type { ObsidianAPI } from "../obsidian-api"

export class ReadNoteTool extends BaseTool {
  constructor(api: ObsidianAPI) {
    super(api, "readNote", "Read the contents of a specific note", {
      type: "object",
      required: ["path"],
      properties: {
        path: {
          type: "string",
          description: "Path to the note to read",
        },
      },
    })
  }

  async execute(args: { path: string }): Promise<ToolResponse> {
    const note = await this.api.readNote(args.path)
    return {
      content: [
        {
          type: "text",
          text: note.content,
        },
      ],
    }
  }
}
