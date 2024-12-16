import axios, { AxiosInstance } from 'axios';

export interface ObsidianConfig {
  apiKey: string;
  port: number;
  host: string;
}

export interface Note {
  path: string;
  content: string;
  metadata?: Record<string, any>;
}

export class ObsidianAPI {
  private client: AxiosInstance;

  constructor(config: ObsidianConfig) {
    this.client = axios.create({
      baseURL: `http://${config.host}:${config.port}`,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async listNotes(folder?: string): Promise<string[]> {
    const response = await this.client.get('/vault');
    let files = response.data.files || [];
    
    if (folder) {
      files = files.filter((file: string) => file.startsWith(folder));
    }
    
    return files.filter((file: string) => file.endsWith('.md'));
  }

  async readNote(path: string): Promise<Note> {
    const response = await this.client.get(`/vault/${encodeURIComponent(path)}`);
    return {
      path,
      content: response.data.content,
      metadata: response.data.metadata
    };
  }

  async writeNote(path: string, content: string): Promise<void> {
    await this.client.put(`/vault/${encodeURIComponent(path)}`, { content });
  }

  async searchNotes(query: string): Promise<Note[]> {
    const response = await this.client.get('/search', { params: { query } });
    return response.data.results.map((result: any) => ({
      path: result.path,
      content: result.content,
      metadata: result.metadata
    }));
  }

  async getMetadata(path: string): Promise<Record<string, any>> {
    const response = await this.client.get(`/metadata/${encodeURIComponent(path)}`);
    return response.data;
  }
}