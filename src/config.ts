import fs from "node:fs"
import JSON5 from "json5"
import type { ServerConfig } from "./server"
import { debug } from "debug"

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string
    HOST: string
    PORT: string
  }
}

const DEFAULTS = "config.secured.jsonc"
const logger = debug("mcp:config")

export function loadConfig(configPath?: string): ServerConfig {
  // load config first
  const configFile = configPath && fs.existsSync(configPath) ? configPath : DEFAULTS
  logger(`Loading config from ${configFile}`)

  const configContent = fs.readFileSync(configFile, "utf-8")
  const config = JSON5.parse(configContent) as ServerConfig

  // environment variables if they available override the config file
  config.obsidian.apiKey = process.env.API_KEY ?? config.obsidian.apiKey
  config.obsidian.host = process.env.HOST ?? config.obsidian.host
  config.obsidian.port = Number.parseInt(process.env.PORT ?? `${config.obsidian.port}`, 10)

  // try to validate the apiKey from config, for matching pattern /^[a-zA-Z0-9]{32,}$/
  // default key size from Obsidian Local REST API plugin is 64 characters
  if (!/^[a-zA-Z0-9]{32,}$/.test(config.obsidian.apiKey)) {
    logger("Invalid API key, expected at least 32 characters")
  }

  return config
}
