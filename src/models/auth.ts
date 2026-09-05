export interface Credentials {
  username: string;
  password: string;
}

export interface SessionState {
  authenticated: boolean;
  createdAt: string;
}
