import { apiClient } from '@/lib/api';

// Interfaces para costos rígidos
export interface CostoRigido {
  id: number;
  proyecto_id?: number;
  nombre: string;
  descripcion?: string;
  tipo: 'fijo' | 'variable';
  valor: number;
  moneda: string;
  frecuencia?: string;
  fecha_aplicacion?: string;
  categoria?: string;
  proveedor?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
  proyecto?: any;
  valor_anual?: number;
  valor_mensual?: number;
}

export interface CostoRigidoCreateData {
  proyecto_id?: number;
  nombre: string;
  descripcion?: string;
  tipo: 'fijo' | 'variable';
  valor: number;
  moneda?: string;
  frecuencia?: string;
  fecha_aplicacion?: string;
  categoria?: string;
  proveedor?: string;
}

export interface CostoRigidoUpdateData extends Partial<CostoRigidoCreateData> {
  activo?: boolean;
}

// Servicio de costos rígidos
export const costosRigidosService = {
  list: async (params?: Record<string, any>): Promise<CostoRigido[]> => {
    return apiClient.get<CostoRigido[]>('/costos-rigidos/costos-rigidos/', params);
  },

  getById: async (id: number): Promise<CostoRigido> => {
    return apiClient.get<CostoRigido>(`/costos-rigidos/costos-rigidos/${id}/`);
  },

  create: async (data: CostoRigidoCreateData): Promise<CostoRigido> => {
    return apiClient.post<CostoRigido>('/costos-rigidos/costos-rigidos/', data);
  },

  update: async (id: number, data: CostoRigidoUpdateData): Promise<CostoRigido> => {
    return apiClient.put<CostoRigido>(`/costos-rigidos/costos-rigidos/${id}/`, data);
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/costos-rigidos/costos-rigidos/${id}/`);
  },

  getByCategory: async (categoria: string): Promise<CostoRigido[]> => {
    return apiClient.get<CostoRigido[]>(`/costos-rigidos/costos-rigidos/?categoria=${categoria}`);
  },

  getStatistics: async (): Promise<any> => {
    return apiClient.get<any>('/costos-rigidos/costos-rigidos/estadisticas/resumen/');
  },

  getCategories: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/costos-rigidos/costos-rigidos/categorias/lista/');
  },

  getProviders: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/costos-rigidos/costos-rigidos/proveedores/lista/');
  },

  calculateProjection: async (): Promise<any> => {
    return apiClient.get<any>('/costos-rigidos/costos-rigidos/calcular-proyeccion/');
  },

  activate: async (id: number): Promise<CostoRigido> => {
    return apiClient.patch<CostoRigido>(`/costos-rigidos/costos-rigidos/${id}/activar/`);
  },

  deactivate: async (id: number): Promise<CostoRigido> => {
    return apiClient.patch<CostoRigido>(`/costos-rigidos/costos-rigidos/${id}/desactivar/`);
  }
};
