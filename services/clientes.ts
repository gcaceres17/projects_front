import api from '../lib/api';
import { PaginationParams, PaginationResponse } from './colaboradores';

export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  empresa?: string;
  direccion?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClienteCreate {
  nombre: string;
  email: string;
  telefono?: string;
  empresa?: string;
  direccion?: string;
}

export const clientesService = {
  async getAll(params: PaginationParams = {}): Promise<PaginationResponse<Cliente>> {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;
    const response = await api.get(`/clientes?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async getById(id: number): Promise<Cliente> {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  async create(data: ClienteCreate): Promise<Cliente> {
    const response = await api.post('/clientes', data);
    return response.data;
  },

  async update(id: number, data: Partial<ClienteCreate>): Promise<Cliente> {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/clientes/${id}`);
  },

  async getProyectos(id: number): Promise<any[]> {
    const response = await api.get(`/clientes/${id}/proyectos`);
    return response.data;
  },

  async getEstadisticas(id: number): Promise<any> {
    const response = await api.get(`/clientes/${id}/estadisticas`);
    return response.data;
  }
};
