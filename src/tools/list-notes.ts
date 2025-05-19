import { z } from "zod"

import type { IObsidianAPI } from "../types.ts"

export const name = "listNotes"

export const description = "List all notes in the vault or a specific folder"

export const shape = {
  folder: z.string().optional(),
}

export const schema = z.object(shape)

export type Schema = z.infer<typeof schema>

export const executor = (api: IObsidianAPI) => async (data: Schema) => {
  const notes = await api.listNotes(data.folder)
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(notes, null, 2),
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
