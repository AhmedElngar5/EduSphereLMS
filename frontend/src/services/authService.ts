import api, { setAuthToken } from './api';
import { AuthResponse, User } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

export const authService = {
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', request);
    if (response.data?.token) {
      setAuthToken(response.data.token);
    }
    return response.data;
  },

  register: async (request: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', request);
    if (response.data?.token) {
      setAuthToken(response.data.token);
    }
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  logout: (): void => {
    setAuthToken(null);
  },
};

