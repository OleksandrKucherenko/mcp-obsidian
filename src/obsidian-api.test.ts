import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObsidianAPI, type ObsidianConfig } from "./obsidian-api";
import axios from "axios";

// Mock axios
vi.mock("axios", () => {
	return {
		default: {
			create: vi.fn(() => ({
				get: vi.fn(),
				put: vi.fn(),
			})),
		},
	};
});

// Mock https
vi.mock("node:https", () => {
	return {
		default: {
			Agent: vi.fn(),
		},
	};
});

// Mock debug
vi.mock("debug", () => {
	return {
		debug: vi.fn(() => vi.fn()),
	};
});

// Mock axios-debug-log
vi.mock("axios-debug-log", () => {
	return {
		addLogger: vi.fn(),
	};
});

describe("ObsidianAPI - Unit Tests", () => {
	let api: ObsidianAPI;
	let mockClient: {
		get: ReturnType<typeof vi.fn>;
		put: ReturnType<typeof vi.fn>;
	};
	const config: ObsidianConfig = {
		apiKey: "test-api-key",
		port: 27124,
		host: "127.0.0.1",
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockClient = {
			get: vi.fn(),
			put: vi.fn(),
		};
		// Using correct type for mocked function
		(axios.create as ReturnType<typeof vi.fn>).mockReturnValue(mockClient);
		api = new ObsidianAPI(config);
	});

	describe("constructor", () => {
		it("should create an axios client with the correct configuration", () => {
			expect(axios.create).toHaveBeenCalledTimes(1);
			const createCall = (axios.create as ReturnType<typeof vi.fn>).mock
				.calls[0][0];
			expect(createCall.baseURL).toBe("http://127.0.0.1:27124");
			expect(createCall.headers.Authorization).toBe("Bearer test-api-key");
			expect(createCall.headers["Content-Type"]).toBe("application/json");
			expect(createCall.proxy).toBe(false);
			// Check that httpsAgent is defined (for self-signed certificates)
			expect(createCall.httpsAgent).toBeDefined();
		});

		it("should handle https URLs correctly", () => {
			const httpsConfig = { ...config, host: "https://localhost" };
			new ObsidianAPI(httpsConfig);
			const createCall = (axios.create as ReturnType<typeof vi.fn>).mock
				.calls[1][0];
			expect(createCall.baseURL).toBe("https://localhost:27124");
		});
	});

	describe("listNotes", () => {
		it("should retrieve all markdown files", async () => {
			mockClient.get.mockResolvedValueOnce({
				data: {
					files: ["note1.md", "note2.md", "file.txt", "folder/note3.md"],
				},
			});

			const result = await api.listNotes();
			expect(mockClient.get).toHaveBeenCalledWith("/vault");
			expect(result).toEqual(["note1.md", "note2.md", "folder/note3.md"]);
		});

		it("should filter by folder when provided", async () => {
			mockClient.get.mockResolvedValueOnce({
				data: {
					files: ["note1.md", "folder/note2.md", "folder/subfolder/note3.md"],
				},
			});

			const result = await api.listNotes("folder");
			expect(mockClient.get).toHaveBeenCalledWith("/vault");
			expect(result).toEqual(["folder/note2.md", "folder/subfolder/note3.md"]);
		});

		it("should handle empty response", async () => {
			mockClient.get.mockResolvedValueOnce({ data: {} });
			const result = await api.listNotes();
			expect(result).toEqual([]);
		});
	});

	describe("readNote", () => {
		it("should retrieve a note by path", async () => {
			const path = "folder/note.md";
			const content = "Note content";
			const metadata = { tags: ["test"] };

			mockClient.get.mockResolvedValueOnce({
				data: { content, metadata },
			});

			const result = await api.readNote(path);
			expect(mockClient.get).toHaveBeenCalledWith("/vault/folder%2Fnote.md");
			expect(result).toEqual({ path, content, metadata });
		});
	});

	describe("writeNote", () => {
		it("should save a note with the given content", async () => {
			const path = "folder/note.md";
			const content = "Updated content";

			mockClient.put.mockResolvedValueOnce({});

			await api.writeNote(path, content);
			expect(mockClient.put).toHaveBeenCalledWith("/vault/folder%2Fnote.md", {
				content,
			});
		});
	});

	describe("searchNotes", () => {
		it("should search for notes matching the query", async () => {
			const query = "test query";
			const results = [
				{ path: "note1.md", content: "content1", metadata: { tag: "test" } },
				{ path: "note2.md", content: "content2", metadata: null },
			];

			mockClient.get.mockResolvedValueOnce({
				data: { results },
			});

			const result = await api.searchNotes(query);
			expect(mockClient.get).toHaveBeenCalledWith("/search", {
				params: { query },
			});
			expect(result).toEqual(results);
		});
	});

	describe("getMetadata", () => {
		it("should retrieve metadata for a note", async () => {
			const path = "folder/note.md";
			const metadata = { tags: ["test"], created: "2025-03-23" };

			mockClient.get.mockResolvedValueOnce({
				data: metadata,
			});

			const result = await api.getMetadata(path);
			expect(mockClient.get).toHaveBeenCalledWith("/metadata/folder%2Fnote.md");
			expect(result).toEqual(metadata);
		});
	});
});
