import api from '../lib/api';
import { PaginationParams, PaginationResponse } from './colaboradores';

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string;
  cliente_id: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado: string;
  presupuesto?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProyectoCreate {
  nombre: string;
  descripcion?: string;
  cliente_id: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
  presupuesto?: number;
}

export const proyectosService = {
  async getAll(params: PaginationParams = {}): Promise<PaginationResponse<Proyecto>> {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;
    const response = await api.get(`/proyectos?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async getById(id: number): Promise<Proyecto> {
    const response = await api.get(`/proyectos/${id}`);
    return response.data;
  },

  async create(data: ProyectoCreate): Promise<Proyecto> {
    const response = await api.post('/proyectos', data);
    return response.data;
  },

  async update(id: number, data: Partial<ProyectoCreate>): Promise<Proyecto> {
    const response = await api.put(`/proyectos/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/proyectos/${id}`);
  },

  async getEstadisticas(id: number): Promise<any> {
    const response = await api.get(`/proyectos/${id}/estadisticas`);
    return response.data;
  }
};
