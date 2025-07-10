import { apiClient } from '@/lib/api';

// Interfaces para costos rígidos
export interface CostoRigido {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: 'fijo' | 'porcentaje';
  valor: number;
  categoria: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CostoRigidoCreateData {
  nombre: string;
  descripcion?: string;
  tipo: 'fijo' | 'porcentaje';
  valor: number;
  categoria: string;
}

export interface CostoRigidoUpdateData extends Partial<CostoRigidoCreateData> {
  activo?: boolean;
}

// Servicio de costos rígidos
export const costosRigidosService = {
  list: async (params?: Record<string, any>): Promise<CostoRigido[]> => {
    return apiClient.get<CostoRigido[]>('/costos-rigidos', params);
  },

  getById: async (id: number): Promise<CostoRigido> => {
    return apiClient.get<CostoRigido>(`/costos-rigidos/${id}`);
  },

  create: async (data: CostoRigidoCreateData): Promise<CostoRigido> => {
    return apiClient.post<CostoRigido>('/costos-rigidos', data);
  },

  update: async (id: number, data: CostoRigidoUpdateData): Promise<CostoRigido> => {
    return apiClient.put<CostoRigido>(`/costos-rigidos/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/costos-rigidos/${id}`);
  },

  getByCategory: async (categoria: string): Promise<CostoRigido[]> => {
    return apiClient.get<CostoRigido[]>(`/costos-rigidos?categoria=${categoria}`);
  },

  getStatistics: async (): Promise<any> => {
    return apiClient.get<any>('/costos-rigidos/estadisticas');
  },

  activate: async (id: number): Promise<CostoRigido> => {
    return apiClient.patch<CostoRigido>(`/costos-rigidos/${id}/activar`);
  },

  deactivate: async (id: number): Promise<CostoRigido> => {
    return apiClient.patch<CostoRigido>(`/costos-rigidos/${id}/desactivar`);
  }
};
