import { z } from "zod"
import type { IObsidianAPI } from "../types.ts"

export const name = "readNote"

export const description = "Read the contents of a specific note"

export const shape = {
  path: z.string(),
}

export const schema = z.object(shape)

export type Schema = z.infer<typeof schema>

export const executor = (api: IObsidianAPI) => async (args: Schema) => {
  const note = await api.readNote(args.path)
  return {
    content: [
      {
        type: "text",
        text: note.content,
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
