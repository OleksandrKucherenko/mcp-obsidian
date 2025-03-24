// Types for components
interface Error {
  errorCode: number;
  message: string;
}

interface NoteJson {
  content: string;
  frontmatter: Record<string, any>;
  path: string;
  stat: {
    ctime: number;
    mtime: number;
    size: number;
  };
  tags: string[];
}

// API Request and Response Types
interface GetStatusResponse {
  authenticated: boolean;
  ok: string;
  service: string;
  versions: {
    obsidian: string;
    self: string;
  };
}

interface GetActiveFileResponse {
  authenticated: boolean;
  ok: string;
  service: string;
  versions: {
    obsidian: string;
    self: string;
  };
}

interface PatchNoteRequest {
  Operation: 'append' | 'prepend' | 'replace';
  'Target-Type': 'heading' | 'block' | 'frontmatter';
  'Target-Delimiter'?: string;
  Target: string;
  'Trim-Target-Whitespace'?: 'true' | 'false';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  body: string | string[];
}

interface PatchNoteResponse {
  status: string;
}

interface PostNoteRequest {
  body: string;
}

interface PostNoteResponse {
  status: string;
}

// API Paths
type GetStatus = () => Promise<GetStatusResponse>;
type DeleteActiveFile = () => Promise<void>;
type GetActiveFile = () => Promise<GetActiveFileResponse>;
type PatchNote = (request: PatchNoteRequest) => Promise<PatchNoteResponse>;
type PostNote = (request: PostNoteRequest) => Promise<PostNoteResponse>;
type PutNote = (request: PostNoteRequest) => Promise<void>;

// Exported API Methods
export {
  Error,
  NoteJson,
  GetStatusResponse,
  GetActiveFileResponse,
  PatchNoteRequest,
  PatchNoteResponse,
  PostNoteRequest,
  PostNoteResponse,
  GetStatus,
  DeleteActiveFile,
  GetActiveFile,
  PatchNote,
  PostNote,
  PutNote,
};
