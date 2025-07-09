// Tipos de usuario
export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  es_admin: boolean;
  activo: boolean;
  fecha_creacion: string;
  fecha_ultimo_acceso?: string;
}

// Tipos de autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
}

// Tipos de respuesta de la API
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}
