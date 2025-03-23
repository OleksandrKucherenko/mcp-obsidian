import fs from "node:fs";
import JSON5 from "json5";
import type { ServerConfig } from "./server";

declare namespace NodeJS {
	interface ProcessEnv {
		API_KEY: string;
		HOST: string;
		PORT: string;
	}
}

const DEFAULTS = "config.secured.jsonc";

export function loadConfig(configPath: string): ServerConfig {
	// load config first
	const configFile = fs.existsSync(configPath) ? configPath : DEFAULTS;
	const configContent = fs.readFileSync(configFile, "utf-8");
	const config = JSON5.parse(configContent) as ServerConfig;

	// environment variables if they available override the config file
	config.obsidian.apiKey = process.env.API_KEY ?? config.obsidian.apiKey;
	config.obsidian.host = process.env.HOST ?? config.obsidian.host;
	config.obsidian.port = Number.parseInt(
		process.env.PORT ?? `${config.obsidian.port}`,
		10,
	);

	return config;
}
