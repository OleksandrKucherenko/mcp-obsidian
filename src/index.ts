import { loadConfig } from "./config"
import { ObsidianMCPServer } from "./server"

console.log("wrong file, use src/cli.ts or dist/cli.js for running")

const config = loadConfig()
const server = new ObsidianMCPServer(config)

await server.start()
