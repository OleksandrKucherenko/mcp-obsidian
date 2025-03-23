import axios, { type AxiosInstance } from "axios";
import { addLogger } from "axios-debug-log";
import { debug } from "debug";
import https from "node:https";

export interface ObsidianConfig {
	apiKey: string;
	port: number;
	host: string;
}

export interface Note {
	path: string;
	content: string;
	metadata?: Record<string, unknown>;
}

export class ObsidianAPI {
	private client: AxiosInstance;

	constructor(config: ObsidianConfig) {
		// support HTTPs
		const baseURL =
			config.host.includes("https://") || config.host.includes("http://")
				? `${config.host}:${config.port}`
				: `http://${config.host}:${config.port}`;

		// Create https agent that accepts self-signed certificates
		const httpsAgent = new https.Agent({
			rejectUnauthorized: false, // Allow self-signed certificates
		});

		this.client = axios.create({
			baseURL,
			proxy: false,
			headers: {
				Authorization: `Bearer ${config.apiKey}`,
				"Content-Type": "application/json",
			},
			httpsAgent, // Use the custom agent for HTTPS requests
		});

		const logger = debug("mcp:obsidian-api");
		addLogger(this.client, logger);
	}

	async listNotes(folder?: string): Promise<string[]> {
		const response = await this.client.get("/vault");
		let files = response.data.files || [];

		if (folder) {
			files = files.filter((file: string) => file.startsWith(folder));
		}

		return files.filter((file: string) => file.endsWith(".md"));
	}

	async readNote(path: string): Promise<Note> {
		const response = await this.client.get(
			`/vault/${encodeURIComponent(path)}`,
		);
		return {
			path,
			content: response.data.content,
			metadata: response.data.metadata,
		};
	}

	async writeNote(path: string, content: string): Promise<void> {
		await this.client.put(`/vault/${encodeURIComponent(path)}`, { content });
	}

	async searchNotes(query: string): Promise<Note[]> {
		const response = await this.client.get("/search", { params: { query } });
		// biome-ignore lint/suspicious/noExplicitAny: Make it simple
		return response.data.results.map((result: any) => ({
			path: result.path,
			content: result.content,
			metadata: result.metadata,
		}));
	}

	async getMetadata(path: string): Promise<Record<string, unknown>> {
		const response = await this.client.get(
			`/metadata/${encodeURIComponent(path)}`,
		);
		return response.data;
	}
}
