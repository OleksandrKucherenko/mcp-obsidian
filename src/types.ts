export interface Tool {
	getName(): string;
	getDefinition(): ToolDefinition;
	execute(args: any): Promise<ToolResponse>;
}

export interface ToolDefinition {
	name: string;
	description: string;
	inputSchema: object;
}

export interface ToolResponse {
	content: Array<{
		type: string;
		text: string;
	}>;
}

export interface Server {
	config: {
		name: string;
		version: string;
		readOnly: boolean;
	};
	connect(transport: any): Promise<void>;
	registerTool(tool: Tool): void;
}

export interface ServerTransport {
	connect(): Promise<void>;
}
