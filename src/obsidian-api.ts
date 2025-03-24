import axios, { type AxiosInstance } from "axios"
import { addLogger } from "axios-debug-log"
import { debug } from "debug"
import https from "node:https"
import type { IObsidianAPI, Note, ObsidianConfig } from "./types"

/**
 * V1 implementation of the Obsidian API
 * Note: This implementation has some integration issues
 * @deprecated Consider using the v2 implementation for correct API integration
 */
export class ObsidianAPI implements IObsidianAPI {
  private client: AxiosInstance

  constructor(config: ObsidianConfig) {
    // support HTTPs
    const baseURL =
      config.host.includes("https://") || config.host.includes("http://")
        ? `${config.host}:${config.port}`
        : `http://${config.host}:${config.port}`

    // Create https agent that accepts self-signed certificates
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // Allow self-signed certificates
    })

    this.client = axios.create({
      baseURL,
      proxy: false,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      httpsAgent, // Use the custom agent for HTTPS requests
    })

    const logger = debug("mcp:obsidian-api")
    addLogger(this.client, logger)
  }

  // ref: https://coddingtonbear.github.io/obsidian-local-rest-api/#/Vault%20Directories/get_vault_
  async listNotes(folder?: string): Promise<string[]> {
    const response = await this.client.get("/vault/")
    let files = response.data.files || []

    if (folder) {
      files = files.filter((file: string) => file.startsWith(folder))
    }

    return files.filter((file: string) => file.endsWith(".md"))
  }

  // ref1: https://coddingtonbear.github.io/obsidian-local-rest-api/#/Vault%20Directories/get_vault__pathToDirectory__
  // ref2: https://coddingtonbear.github.io/obsidian-local-rest-api/#/Vault%20Files/get_vault__filename_
  async readNote(path: string): Promise<Note> {
    const response = await this.client.get(`/vault/${encodeURIComponent(path)}`)
    return {
      path,
      content: response.data.content,
      metadata: response.data.metadata,
    }
  }

  async writeNote(path: string, content: string): Promise<void> {
    await this.client.put(`/vault/${encodeURIComponent(path)}`, { content })
  }

  // ref: https://coddingtonbear.github.io/obsidian-local-rest-api/#/Search/post_search_simple_
  async searchNotes(query: string, contextLength = 100): Promise<Note[]> {
    // API expects query parameters, not a request body
    const response = await this.client.post("/search/simple/", null, { params: { query, contextLength } })

    // Transform the API response to match the Note interface
    // The API returns an array of search results with filename and matches
    // biome-ignore lint/suspicious/noExplicitAny: Necessary for dynamic API response
    return (response.data || []).map((result: any) => {
      // Combine all match contexts into a single content string
      // biome-ignore lint/suspicious/noExplicitAny: Keep it simple
      const content = result.matches?.map((match: any) => match.context || "").join("\n\n") || ""

      return {
        path: result.filename,
        content,
        metadata: { score: result.score },
      }
    })
  }

  async getMetadata(path: string): Promise<Record<string, unknown>> {
    const response = await this.client.get(`/metadata/${encodeURIComponent(path)}`)
    return response.data
  }
}
