import api from '../lib/api';
import { PaginationParams, PaginationResponse } from './colaboradores';

export interface Cotizacion {
  id: number;
  numero_cotizacion: string;
  cliente_id: number;
  proyecto_id?: number;
  descripcion: string;
  monto_total: number;
  estado: string;
  fecha_vencimiento?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CotizacionCreate {
  cliente_id: number;
  proyecto_id?: number;
  descripcion: string;
  monto_total: number;
  fecha_vencimiento?: string;
}

export const cotizacionesService = {
  async getAll(params: PaginationParams = {}): Promise<PaginationResponse<Cotizacion>> {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;
    const response = await api.get(`/cotizaciones?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async getById(id: number): Promise<Cotizacion> {
    const response = await api.get(`/cotizaciones/${id}`);
    return response.data;
  },

  async create(data: CotizacionCreate): Promise<Cotizacion> {
    const response = await api.post('/cotizaciones', data);
    return response.data;
  },

  async update(id: number, data: Partial<CotizacionCreate>): Promise<Cotizacion> {
    const response = await api.put(`/cotizaciones/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/cotizaciones/${id}`);
  },

  async aprobar(id: number): Promise<Cotizacion> {
    const response = await api.post(`/cotizaciones/${id}/aprobar`);
    return response.data;
  },

  async rechazar(id: number): Promise<Cotizacion> {
    const response = await api.post(`/cotizaciones/${id}/rechazar`);
    return response.data;
  }
};
