import { apiClient } from '@/lib/api';
import { User, LoginRequest, LoginResponse, RegisterRequest } from '@/types/auth';

class AuthService {
  // Login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login/', credentials);
    
    // Guardar token en localStorage
    if (typeof window !== 'undefined' && response.access_token) {
      localStorage.setItem('access_token', response.access_token);
    }
    
    return response;
  }

  // Registro
  async register(data: RegisterRequest): Promise<User> {
    return await apiClient.post<User>('/auth/register/', data);
  }

  // Obtener usuario actual
  async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>('/auth/me/');
  }

  // Logout
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  // Obtener token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  // Obtener usuario del localStorage
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Guardar usuario en localStorage
  setStoredUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
}

export const authService = new AuthService();