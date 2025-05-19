import { z } from "zod"
import type { IObsidianAPI } from "../types.ts"

export const name = "writeNote"

export const description = "Create or update a note"

export const shape = {
  path: z.string(),
  content: z.string(),
}

export const schema = z.object(shape)

export type Schema = z.infer<typeof schema>

export const executor = (api: IObsidianAPI) => async (args: Schema) => {
  await api.writeNote(args.path, args.content)
  return {
    content: [
      {
        type: "text",
        text: `Note ${args.path} written successfully`,
      },
    ],
  }
}

export default {
  name,
  description,
  schema,
  shape,
  executor,
}
