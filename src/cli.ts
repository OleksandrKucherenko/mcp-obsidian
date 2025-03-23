#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { loadConfig } from "./config";
import { ObsidianMCPServer } from "./server";
import type { Config } from "./types";

export const main = async (argv: yargs.Arguments<Config>) => {
	try {
		const config = loadConfig(argv.config);
		const server = new ObsidianMCPServer(config);
		await server.start();
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

yargs(hideBin(process.argv))
	.command(
		"$0",
		"Start the Obsidian MCP server",
		(yargs: yargs.Argv): yargs.Argv<Config> => {
			return yargs.option("config", {
				alias: "c",
				type: "string",
				description: "Path to config file",
				demandOption: true,
			});
		},
		main,
	)
	.help().argv;
