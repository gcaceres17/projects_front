import api from '../lib/api';
import { PaginationParams, PaginationResponse } from './colaboradores';

export interface CostoRigido {
  id: number;
  nombre: string;
  descripcion?: string;
  categoria: string;
  monto: number;
  frecuencia: string;
  proveedor?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CostoRigidoCreate {
  nombre: string;
  descripcion?: string;
  categoria: string;
  monto: number;
  frecuencia: string;
  proveedor?: string;
}

export const costosRigidosService = {
  async getAll(params: PaginationParams = {}): Promise<PaginationResponse<CostoRigido>> {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;
    const response = await api.get(`/costos-rigidos?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async getById(id: number): Promise<CostoRigido> {
    const response = await api.get(`/costos-rigidos/${id}`);
    return response.data;
  },

  async create(data: CostoRigidoCreate): Promise<CostoRigido> {
    const response = await api.post('/costos-rigidos', data);
    return response.data;
  },

  async update(id: number, data: Partial<CostoRigidoCreate>): Promise<CostoRigido> {
    const response = await api.put(`/costos-rigidos/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/costos-rigidos/${id}`);
  },

  async getEstadisticasResumen(): Promise<any> {
    const response = await api.get('/costos-rigidos/estadisticas/resumen');
    return response.data;
  },

  async getCategorias(): Promise<string[]> {
    const response = await api.get('/costos-rigidos/categorias/lista');
    return response.data;
  },

  async getProveedores(): Promise<string[]> {
    const response = await api.get('/costos-rigidos/proveedores/lista');
    return response.data;
  }
};
