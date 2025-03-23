import { describe, it, expect, beforeAll } from "vitest"
import { ObsidianAPI, type ObsidianConfig } from "./obsidian-api"
import axios from "axios"
import https from "node:https"

// Helper function to check if host is available
async function isHostAvailable(url: string): Promise<boolean> {
  try {
    // Create an axios instance that doesn't reject unauthorized SSL certificates
    const instance = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      timeout: 3000, // 3 second timeout
    })

    await instance.get(url)
    return true
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // If we get any response, the host is available even if it returns an error code
      return true
    }
    return false
  }
}

describe("ObsidianAPI - E2E Tests", () => {
  const config: ObsidianConfig = {
    apiKey: "YOUR_API_KEY", // Replace with your actual API key for testing
    port: 27124,
    host: "https://127.0.0.1",
    // host: "https://host.docker.internal", // Use special hostname to access Windows host from WSL
  }

  let hostAvailable = false
  let api: ObsidianAPI

  beforeAll(async () => {
    // Check if the Obsidian REST API server is available
    hostAvailable = await isHostAvailable(`${config.host}:${config.port}`)

    if (!hostAvailable) {
      console.error(
        `\n⛔ ERROR: Obsidian REST API server is not available at ${config.host}:${config.port}\nPlease make sure the server is running before executing E2E tests.\n`,
      )
    } else {
      // Initialize API only if host is available
      api = new ObsidianAPI(config)
    }
  })

  // We'll conditionally skip the entire describe block if host is not available
  const conditionalDescribe = hostAvailable ? describe : describe.skip

  conditionalDescribe("API Connection", () => {
    it("should connect to the Obsidian REST API server", async () => {
      // This test passes if beforeAll successfully created the API instance
      expect(api).toBeDefined()
    })
  })

  conditionalDescribe("listNotes", () => {
    it("should retrieve notes from the vault", async () => {
      const notes = await api.listNotes()

      // We expect to get an array of notes (even if empty)
      expect(Array.isArray(notes)).toBe(true)

      // If there are notes, they should be markdown files
      if (notes.length > 0) {
        expect(notes.every((note) => note.endsWith(".md"))).toBe(true)
      }
    })
  })

  conditionalDescribe("readNote", () => {
    it("should retrieve a note if it exists", async () => {
      // First get a list of notes, then try to read the first one
      const notes = await api.listNotes()

      if (notes.length === 0) {
        // Skip this test if there are no notes
        return
      }

      const notePath = notes[0]
      const note = await api.readNote(notePath)

      expect(note).toBeDefined()
      expect(note.path).toBe(notePath)
      expect(typeof note.content).toBe("string")
    })
  })

  conditionalDescribe("searchNotes", () => {
    it("should search for notes matching a query", async () => {
      // Search for a generic term that might match something
      const searchResults = await api.searchNotes("the")

      expect(Array.isArray(searchResults)).toBe(true)
    })
  })

  conditionalDescribe("getMetadata", () => {
    it("should retrieve metadata for a note if it exists", async () => {
      // First get a list of notes, then try to get metadata for the first one
      const notes = await api.listNotes()

      if (notes.length === 0) {
        // Skip this test if there are no notes
        return
      }

      const notePath = notes[0]
      const metadata = await api.getMetadata(notePath)

      expect(metadata).toBeDefined()
      // metadata should be an object
      expect(typeof metadata).toBe("object")
    })
  })

  conditionalDescribe("writeNote", () => {
    it("should write content to a test note and read it back", async () => {
      const testNotePath = "_test_note.md"
      const testContent = `# Test Note\nThis is a test note created by the E2E tests on ${new Date().toISOString()}`

      try {
        // Write the test note
        await api.writeNote(testNotePath, testContent)

        // Read it back
        const note = await api.readNote(testNotePath)

        expect(note.path).toBe(testNotePath)
        expect(note.content).toBe(testContent)
      } finally {
        // Clean up by writing an empty note
        // (Ideally we would delete it, but the API might not support that)
        try {
          await api.writeNote(testNotePath, "")
        } catch (error) {
          console.warn("Failed to clean up test note:", error)
        }
      }
    })
  })
})
