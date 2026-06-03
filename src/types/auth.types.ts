export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  zoneInfo: string;
}

export interface AuthResponse {
  accessToken: string;
  username: string;
}
