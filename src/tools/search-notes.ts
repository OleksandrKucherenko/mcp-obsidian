import { z } from "zod"
import type { IObsidianAPI } from "../types.ts"

export const name = "searchNotes"

export const description = "Search for notes using a query string"

export const shape = {
  query: z.string(),
}

export const schema = z.object(shape)

export type Schema = z.infer<typeof schema>

export const executor = (api: IObsidianAPI) => async (args: Schema) => {
  const results = await api.searchNotes(args.query)
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(results, null, 2),
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
