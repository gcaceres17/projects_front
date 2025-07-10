import { apiClient } from '@/lib/api';

// Interfaces para colaboradores
export interface Colaborador {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  cargo: string;
  salario: number;
  fecha_ingreso: string;
  tipo: 'interno' | 'externo' | 'freelance';
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ColaboradorCreateData {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  cargo: string;
  salario: number;
  fecha_ingreso: string;
  tipo: 'interno' | 'externo' | 'freelance';
}

export interface ColaboradorUpdateData extends Partial<ColaboradorCreateData> {
  activo?: boolean;
}

// Servicio de colaboradores
export const colaboradoresService = {
  list: async (params?: Record<string, any>): Promise<Colaborador[]> => {
    return apiClient.get<Colaborador[]>('/colaboradores/', params);
  },

  getById: async (id: number): Promise<Colaborador> => {
    return apiClient.get<Colaborador>(`/colaboradores/${id}/`);
  },

  create: async (data: ColaboradorCreateData): Promise<Colaborador> => {
    return apiClient.post<Colaborador>('/colaboradores/', data);
  },

  update: async (id: number, data: ColaboradorUpdateData): Promise<Colaborador> => {
    return apiClient.put<Colaborador>(`/colaboradores/${id}/`, data);
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/colaboradores/${id}/`);
  },

  getStatistics: async (): Promise<any> => {
    return apiClient.get<any>('/colaboradores/estadisticas/');
  },

  getByType: async (tipo: string): Promise<Colaborador[]> => {
    return apiClient.get<Colaborador[]>(`/colaboradores/?tipo=${tipo}`);
  },

  activate: async (id: number): Promise<Colaborador> => {
    return apiClient.patch<Colaborador>(`/colaboradores/${id}/activar/`);
  },

  deactivate: async (id: number): Promise<Colaborador> => {
    return apiClient.patch<Colaborador>(`/colaboradores/${id}/desactivar/`);
  }
};
