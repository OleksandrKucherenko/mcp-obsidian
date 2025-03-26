import type { IObsidianAPI, ToolResponse } from "../types"
import { BaseTool } from "./base-tool"

export class WriteNoteTool extends BaseTool {
  constructor(api: IObsidianAPI) {
    super(api, "writeNote", "Create or update a note", {
      type: "object",
      required: ["path", "content"],
      properties: {
        path: {
          type: "string",
          description: "Path where to create/update the note",
        },
        content: {
          type: "string",
          description: "Content of the note",
        },
      },
    })
  }

  async execute(args: {
    path: string
    content: string
  }): Promise<ToolResponse> {
    await this.api.writeNote(args.path, args.content)
    return {
      content: [
        {
          type: "text",
          text: `Note ${args.path} written successfully`,
        },
      ],
    }
  }
}
