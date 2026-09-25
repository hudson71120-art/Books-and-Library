export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  username: string;
  bookClubEmail: string;
  libraryEmail: string;
  avatarUrl: string;
  bio: string;
  favoriteGenre: string;
  role: UserRole;
  isDemo?: boolean;
  clubsCount: number;
  completedBooksCount: number;
  chaptersReadCount: number;
  createdAt: string;
}

export interface ReadingSession {
  id: string;
  hostId: string;
  hostName: string;
  inviteCode: string;
  bookTitle: string;
  author: string;
  totalChapters: number;
  targetFinishDate?: string;
  borrowStatus: boolean;
  coverArtworkUrl?: string;
  directBookUrl?: string;
  clubNote?: string;
  createdAt: string;
  membersCount: number;
}

export interface SupabaseConfig {
  projectId?: string;
  url: string;
  anonKey: string;
  secretKey?: string;
  jwksUrl?: string;
  isConnected: boolean;
  lastChecked?: string;
  latencyMs?: number;
}

export type PipelineStage = 'input' | 'network' | 'process' | 'output';

export interface WorkflowState {
  currentStage: PipelineStage;
  inputStatus: 'ready' | 'pending' | 'error';
  networkStatus: 'connected' | 'checking' | 'failed' | 'idle';
  supabaseConnected: boolean;
  openLibraryConnected: boolean;
  processStatus: 'validated' | 'processing' | 'idle';
  outputStatus: 'rendered' | 'pending';
  lastLog?: string;
}
