import fs from "node:fs"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { loadConfig } from "./config"

// Mock dependencies
vi.mock("node:fs")

describe("Configuration", () => {
  const mockConfig = {
    obsidian: {
      apiKey: "test-api-key",
      host: "localhost",
      port: 9000,
    },
  }

  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetAllMocks()

    // Setup default mocks
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfig))

    // exclude our dependencies
    const { API_KEY, HOST, PORT, ...rest } = process.env
    process.env = { ...rest }
  })

  afterEach(() => {
    // Restore environment variables
    process.env = { ...originalEnv }
  })

  it("should use the specified config file when it exists", () => {
    // Setup mocks
    vi.mocked(fs.existsSync).mockReturnValue(true)

    // Call the loadConfig function
    loadConfig("custom-config.json")

    // Assertions
    expect(fs.existsSync).toHaveBeenCalledWith("custom-config.json")
    expect(fs.readFileSync).toHaveBeenCalledWith("custom-config.json", "utf-8")
  })

  it("should fall back to default config file when specified file does not exist", () => {
    // Setup mocks
    vi.mocked(fs.existsSync).mockReturnValue(false)

    // Call the loadConfig function
    loadConfig("non-existent-config.json")

    // Assertions
    expect(fs.existsSync).toHaveBeenCalledWith("non-existent-config.json")
    expect(fs.readFileSync).toHaveBeenCalledWith("config.secured.jsonc", "utf-8")
  })

  it("should override config with environment variables when provided", () => {
    // Setup environment variables
    process.env.API_KEY = "env-api-key"
    process.env.HOST = "env-host"
    process.env.PORT = "8080"

    // Call the loadConfig function
    const config = loadConfig("config.json")

    // Assertions
    expect(config).toEqual({
      obsidian: {
        apiKey: "env-api-key",
        host: "env-host",
        port: 8080,
      },
    })
  })

  it("should use config file values when environment variables are not provided", () => {
    // Call the loadConfig function
    const config = loadConfig("config.json")

    // Assertions
    expect(config).toEqual(mockConfig)
  })

  it("should handle errors from file reading", () => {
    // Setup mocks to throw an error
    const mockError = new Error("Test error")
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw mockError
    })

    // Assertions
    expect(() => loadConfig("config.json")).toThrow("Test error")
  })
})
