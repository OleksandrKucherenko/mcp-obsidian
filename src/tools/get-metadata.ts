import type { IObsidianAPI } from "../types.ts"
import { z } from "zod"

export const name = "getMetadata"

export const description = "Get metadata for a specific note"

export const shape = {
  path: z.string(),
}

export const schema = z.object(shape)

export type Schema = z.infer<typeof schema>

export const executor = (api: IObsidianAPI) => async (args: Schema) => {
  const metadata = await api.getMetadata(args.path)
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(metadata, null, 2),
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
