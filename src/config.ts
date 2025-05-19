import fs from "node:fs"
import JSON5 from "json5"
import type { ServerConfig } from "./server.ts"
import { debug } from "debug"
import dotenvExpand from "dotenv-expand"

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string
    API_HOST: string
    API_PORT: string
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

  const parsed = {
    API_KEY: process.env.API_KEY ?? config.obsidian.apiKey,
    API_HOST: process.env.API_HOST ?? config.obsidian.host,
    API_PORT: process.env.API_PORT ?? `${config.obsidian.port}`,
  }

  // support env variable in config files
  const { parsed: resolved } = dotenvExpand.expand({ parsed })
  if (!resolved) throw new Error("Failed to expand environment variables")

  logger("Expanded config: %o", resolved)

  // environment variables if they available override the config file
  config.obsidian.apiKey = <string>resolved.API_KEY
  config.obsidian.host = <string>resolved.API_HOST
  config.obsidian.port = Number.parseInt(<string>resolved.API_PORT, 10)

  // try to validate the apiKey from config, for matching pattern /^[a-zA-Z0-9]{32,}$/
  // default key size from Obsidian Local REST API plugin is 64 characters
  if (!/^[a-zA-Z0-9]{32,}$/.test(config.obsidian.apiKey)) {
    logger("Invalid API key, expected at least 32 characters")
  }

  logger("server:", config.obsidian.host, config.obsidian.port)

  return config
}
