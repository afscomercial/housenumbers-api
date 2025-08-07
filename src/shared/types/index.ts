export interface CreateSnippetRequest {
  text: string;
}

export interface SnippetResponse {
  id: string;
  text: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: string;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
}

export interface SummaryService {
  summarize(text: string): Promise<string>;
}