#!/usr/bin/env node

import yargs, { type Argv, type Arguments } from "yargs"
import { hideBin } from "yargs/helpers"
import { loadConfig } from "./config.js"
import { ObsidianMCPServer } from "./server.js"
import type { Config } from "./types.js"

yargs(hideBin(process.argv))
  .command(
    "$0",
    "Start the Obsidian MCP server",
    (yargs: Argv): Argv<Config> => {
      return yargs.option("config", {
        alias: "c",
        type: "string",
        description: "Path to config file",
        demandOption: false,
      })
    },
    async (argv: Arguments<Config>) => {
      try {
        const config = loadConfig(argv.config)
        const server = new ObsidianMCPServer(config)
        await server.start()
      } catch (error) {
        console.error("Failed to start server:", error)
        process.exit(1)
      }
    },
  )
  .help().argv
