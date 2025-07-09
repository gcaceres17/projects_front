import api from '../lib/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
}

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  activo: boolean;
  es_admin: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_ultimo_acceso?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post('/auth/login', {
      email: credentials.email,
      password: credentials.password
    });
    return response.data;
  },

  async register(data: RegisterData): Promise<User> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async refreshToken(): Promise<LoginResponse> {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  },

  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
};
