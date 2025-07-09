import api from '../lib/api';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface Colaborador {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  cargo?: string;
  salario_por_hora?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ColaboradorCreate {
  nombre: string;
  email: string;
  telefono?: string;
  cargo?: string;
  salario_por_hora?: number;
}

export const colaboradoresService = {
  async getAll(params: PaginationParams = {}): Promise<PaginationResponse<Colaborador>> {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;
    const response = await api.get(`/colaboradores?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async getById(id: number): Promise<Colaborador> {
    const response = await api.get(`/colaboradores/${id}`);
    return response.data;
  },

  async create(data: ColaboradorCreate): Promise<Colaborador> {
    const response = await api.post('/colaboradores', data);
    return response.data;
  },

  async update(id: number, data: Partial<ColaboradorCreate>): Promise<Colaborador> {
    const response = await api.put(`/colaboradores/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/colaboradores/${id}`);
  },

  async getEstadisticas(id: number): Promise<any> {
    const response = await api.get(`/colaboradores/${id}/estadisticas`);
    return response.data;
  }
};
