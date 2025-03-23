#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import fs from "node:fs";
import JSON5 from "json5";
import { ObsidianMCPServer, type ServerConfig } from "./server";

declare namespace NodeJS {
	interface ProcessEnv {
		API_KEY: string;
		HOST: string;
		PORT: string;
	}
}

const DEFAULTS = "config.secured.jsonc";

yargs(hideBin(process.argv))
	.command(
		"$0",
		"Start the Obsidian MCP server",
		(yargs) => {
			return yargs.option("config", {
				alias: "c",
				type: "string",
				description: "Path to config file",
				demandOption: true,
			});
		},
		async (argv) => {
			try {
				// load config first
				const configFile = fs.existsSync(argv.config) ? argv.config : DEFAULTS;
				const configContent = fs.readFileSync(configFile, "utf-8");
				const config = JSON5.parse(configContent) as ServerConfig;

				// environment variables if they available override the config file
				config.obsidian.apiKey = process.env.API_KEY ?? config.obsidian.apiKey;
				config.obsidian.host = process.env.HOST ?? config.obsidian.host;
				config.obsidian.port = Number.parseInt(
					process.env.PORT ?? `${config.obsidian.port}`,
					10,
				);

				const server = new ObsidianMCPServer(config);
				await server.start();
			} catch (error) {
				console.error("Failed to start server:", error);
				process.exit(1);
			}
		},
	)
	.help().argv;
