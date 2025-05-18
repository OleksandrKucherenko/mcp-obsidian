import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { ObsidianAPI } from "./obsidian-api"
import type { ObsidianConfig, IObsidianAPI } from "./types"
import axios from "axios"

// #region Mock dependencies
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      put: vi.fn(),
      post: vi.fn(),
    })),
    isAxiosError: vi.fn((error) => error && error.response !== undefined),
  },
}))
vi.mock("node:https", () => ({ default: { Agent: vi.fn() } }))
vi.mock("debug", () => ({ debug: vi.fn(() => vi.fn()) }))
vi.mock("axios-debug-log", () => ({ addLogger: vi.fn() }))
// #endregion

type MockedClient = {
  get: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
}
const config: ObsidianConfig = {
  apiKey: "test-api-key",
  port: 27124,
  host: "127.0.0.1",
}

describe("ObsidianAPI - Unit Tests", () => {
  let api: IObsidianAPI
  let mockClient: MockedClient

  beforeEach(() => {
    mockClient = { get: vi.fn(), put: vi.fn(), post: vi.fn() }
    // Using correct type for mocked function
    ;(axios.create as ReturnType<typeof vi.fn>).mockReturnValue(mockClient)
    api = new ObsidianAPI(config)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("constructor", () => {
    it("should create an axios client with the correct configuration", () => {
      expect(axios.create).toHaveBeenCalledTimes(1)
      const createCall = (axios.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(createCall.baseURL).toBe("http://127.0.0.1:27124")
      expect(createCall.headers.Authorization).toBe("Bearer test-api-key")
      expect(createCall.headers["Content-Type"]).toBe("application/json")
      expect(createCall.proxy).toBe(false)
      // Check that httpsAgent is defined (for self-signed certificates)
      expect(createCall.httpsAgent).toBeDefined()
    })

    it("should handle https URLs correctly", () => {
      const httpsConfig = { ...config, host: "https://localhost" }
      new ObsidianAPI(httpsConfig)
      const createCall = (axios.create as ReturnType<typeof vi.fn>).mock.calls[1][0]
      expect(createCall.baseURL).toBe("https://localhost:27124")
    })
  })

  describe("listNotes", () => {
    it("should retrieve all markdown files", async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          files: ["note1.md", "note2.md", "file.txt", "folder/note3.md"],
        },
      })

      const result = await api.listNotes()
      expect(mockClient.get).toHaveBeenCalledWith("/vault/")
      expect(result).toEqual(["note1.md", "note2.md", "folder/note3.md"])
    })

    it("should filter by folder when provided", async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          files: ["note1.md", "folder/note2.md", "folder/subfolder/note3.md"],
        },
      })

      const result = await api.listNotes("folder")
      expect(mockClient.get).toHaveBeenCalledWith("/vault/folder/")
      expect(result).toEqual(["note1.md", "folder/note2.md", "folder/subfolder/note3.md"])
    })

    it("should handle empty response", async () => {
      mockClient.get.mockResolvedValueOnce({ data: {} })
      const result = await api.listNotes()
      expect(result).toEqual([])
    })
  })

  describe("readNote", () => {
    it("should retrieve a note by path", async () => {
      const path = "folder/note.md"
      const content = "Note content"
      const metadata = { tags: ["test"] }

      mockClient.get.mockResolvedValueOnce({
        data: { content, metadata },
      })

      const result = await api.readNote(path)
      expect(mockClient.get).toHaveBeenCalledWith("/vault/folder%2Fnote.md")
      expect(result).toEqual({ path, content, metadata })
    })
  })

  describe("writeNote", () => {
    it("should save a note with the given content", async () => {
      const path = "folder/note.md"
      const content = "Updated content"

      mockClient.put.mockResolvedValueOnce({})

      await api.writeNote(path, content)
      expect(mockClient.put).toHaveBeenCalledWith("/vault/folder%2Fnote.md", {
        content,
      })
    })
  })

  describe("searchNotes", () => {
    it("should search for notes matching the query", async () => {
      const query = "test query"
      const apiResponse = [
        {
          filename: "note1.md",
          score: 0.75,
          matches: [{ context: "content1" }],
        },
        {
          filename: "note2.md",
          score: 0.5,
          matches: [{ context: "content2" }],
        },
      ]

      const expectedResults = [
        { path: "note1.md", content: "content1", metadata: { score: 0.75 } },
        { path: "note2.md", content: "content2", metadata: { score: 0.5 } },
      ]

      mockClient.post.mockResolvedValueOnce({
        data: apiResponse,
      })

      const result = await api.searchNotes(query)
      expect(mockClient.post).toHaveBeenCalledWith("/search/simple/", null, {
        params: { query, contextLength: 100 },
      })
      expect(result).toEqual(expectedResults)
    })
  })

  describe("getMetadata", () => {
    it("should retrieve metadata for a note", async () => {
      const path = "folder/note.md"
      const metadata = { tags: ["test"], created: "2025-03-23" }

      mockClient.get.mockResolvedValueOnce({
        data: metadata,
      })

      const result = await api.getMetadata(path)
      expect(mockClient.get).toHaveBeenCalledWith("/vault/folder%2Fnote.md", {
        headers: { Accept: "application/vnd.olrapi.note+json" },
      })
      expect(result).toEqual(metadata)
    })
  })
})
